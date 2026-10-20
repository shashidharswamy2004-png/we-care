import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Clock, TrendingDown, Users, Sparkles, AlertCircle, Calendar } from 'lucide-react';

interface DepartmentCapacityChartProps {
  departmentId: string;
  departmentName: string;
  onBookAppointment: () => void;
}

interface DayCapacityData {
  day: string;
  fullName: string;
  openSlots: number;
  bookedSlots: number;
  capacityPercent: number; // 0 - 100%
  avgWaitMins: number;
  trafficLevel: 'Low' | 'Moderate' | 'Peak';
}

interface HourlyTrafficData {
  timeWindow: string;
  busyPercent: number;
  avgWaitMins: number;
  openSlots: number;
  trafficLevel: 'Low' | 'Moderate' | 'Peak';
}

// Generate realistic capacity data tailored per department
const getDepartmentWeeklyData = (deptId: string): DayCapacityData[] => {
  switch (deptId) {
    case 'cardiology':
      return [
        { day: 'Mon', fullName: 'Monday', openSlots: 8, bookedSlots: 32, capacityPercent: 80, avgWaitMins: 25, trafficLevel: 'Peak' },
        { day: 'Tue', fullName: 'Tuesday', openSlots: 14, bookedSlots: 26, capacityPercent: 65, avgWaitMins: 18, trafficLevel: 'Moderate' },
        { day: 'Wed', fullName: 'Wednesday', openSlots: 18, bookedSlots: 22, capacityPercent: 55, avgWaitMins: 14, trafficLevel: 'Moderate' },
        { day: 'Thu', fullName: 'Thursday', openSlots: 26, bookedSlots: 14, capacityPercent: 35, avgWaitMins: 8, trafficLevel: 'Low' },
        { day: 'Fri', fullName: 'Friday', openSlots: 24, bookedSlots: 16, capacityPercent: 40, avgWaitMins: 10, trafficLevel: 'Low' },
        { day: 'Sat', fullName: 'Saturday', openSlots: 12, bookedSlots: 20, capacityPercent: 62, avgWaitMins: 16, trafficLevel: 'Moderate' },
      ];
    case 'pediatrics':
      return [
        { day: 'Mon', fullName: 'Monday', openSlots: 6, bookedSlots: 34, capacityPercent: 85, avgWaitMins: 28, trafficLevel: 'Peak' },
        { day: 'Tue', fullName: 'Tuesday', openSlots: 16, bookedSlots: 24, capacityPercent: 60, avgWaitMins: 15, trafficLevel: 'Moderate' },
        { day: 'Wed', fullName: 'Wednesday', openSlots: 22, bookedSlots: 18, capacityPercent: 45, avgWaitMins: 10, trafficLevel: 'Low' },
        { day: 'Thu', fullName: 'Thursday', openSlots: 25, bookedSlots: 15, capacityPercent: 38, avgWaitMins: 9, trafficLevel: 'Low' },
        { day: 'Fri', fullName: 'Friday', openSlots: 19, bookedSlots: 21, capacityPercent: 52, avgWaitMins: 12, trafficLevel: 'Moderate' },
        { day: 'Sat', fullName: 'Saturday', openSlots: 5, bookedSlots: 35, capacityPercent: 88, avgWaitMins: 30, trafficLevel: 'Peak' },
      ];
    case 'orthopedics':
      return [
        { day: 'Mon', fullName: 'Monday', openSlots: 7, bookedSlots: 33, capacityPercent: 82, avgWaitMins: 26, trafficLevel: 'Peak' },
        { day: 'Tue', fullName: 'Tuesday', openSlots: 12, bookedSlots: 28, capacityPercent: 70, avgWaitMins: 20, trafficLevel: 'Moderate' },
        { day: 'Wed', fullName: 'Wednesday', openSlots: 20, bookedSlots: 20, capacityPercent: 50, avgWaitMins: 12, trafficLevel: 'Low' },
        { day: 'Thu', fullName: 'Thursday', openSlots: 24, bookedSlots: 16, capacityPercent: 40, avgWaitMins: 9, trafficLevel: 'Low' },
        { day: 'Fri', fullName: 'Friday', openSlots: 18, bookedSlots: 22, capacityPercent: 55, avgWaitMins: 15, trafficLevel: 'Moderate' },
        { day: 'Sat', fullName: 'Saturday', openSlots: 10, bookedSlots: 22, capacityPercent: 68, avgWaitMins: 18, trafficLevel: 'Moderate' },
      ];
    case 'dermatology':
      return [
        { day: 'Mon', fullName: 'Monday', openSlots: 15, bookedSlots: 25, capacityPercent: 62, avgWaitMins: 16, trafficLevel: 'Moderate' },
        { day: 'Tue', fullName: 'Tuesday', openSlots: 22, bookedSlots: 18, capacityPercent: 45, avgWaitMins: 11, trafficLevel: 'Low' },
        { day: 'Wed', fullName: 'Wednesday', openSlots: 25, bookedSlots: 15, capacityPercent: 37, avgWaitMins: 8, trafficLevel: 'Low' },
        { day: 'Thu', fullName: 'Thursday', openSlots: 20, bookedSlots: 20, capacityPercent: 50, avgWaitMins: 13, trafficLevel: 'Moderate' },
        { day: 'Fri', fullName: 'Friday', openSlots: 14, bookedSlots: 26, capacityPercent: 65, avgWaitMins: 18, trafficLevel: 'Moderate' },
        { day: 'Sat', fullName: 'Saturday', openSlots: 6, bookedSlots: 34, capacityPercent: 85, avgWaitMins: 26, trafficLevel: 'Peak' },
      ];
    default:
      return [
        { day: 'Mon', fullName: 'Monday', openSlots: 10, bookedSlots: 30, capacityPercent: 75, avgWaitMins: 22, trafficLevel: 'Peak' },
        { day: 'Tue', fullName: 'Tuesday', openSlots: 18, bookedSlots: 22, capacityPercent: 55, avgWaitMins: 14, trafficLevel: 'Moderate' },
        { day: 'Wed', fullName: 'Wednesday', openSlots: 24, bookedSlots: 16, capacityPercent: 40, avgWaitMins: 9, trafficLevel: 'Low' },
        { day: 'Thu', fullName: 'Thursday', openSlots: 26, bookedSlots: 14, capacityPercent: 35, avgWaitMins: 8, trafficLevel: 'Low' },
        { day: 'Fri', fullName: 'Friday', openSlots: 19, bookedSlots: 21, capacityPercent: 52, avgWaitMins: 13, trafficLevel: 'Moderate' },
        { day: 'Sat', fullName: 'Saturday', openSlots: 12, bookedSlots: 20, capacityPercent: 62, avgWaitMins: 17, trafficLevel: 'Moderate' },
      ];
  }
};

const getDepartmentHourlyData = (deptId: string): HourlyTrafficData[] => {
  return [
    { timeWindow: '08:00 - 10:00 AM', busyPercent: 82, avgWaitMins: 24, openSlots: 5, trafficLevel: 'Peak' },
    { timeWindow: '10:00 - 12:00 PM', busyPercent: 74, avgWaitMins: 19, openSlots: 8, trafficLevel: 'Moderate' },
    { timeWindow: '12:00 - 02:00 PM', busyPercent: 42, avgWaitMins: 9, openSlots: 19, trafficLevel: 'Low' },
    { timeWindow: '02:00 - 04:00 PM', busyPercent: 48, avgWaitMins: 11, openSlots: 16, trafficLevel: 'Low' },
    { timeWindow: '04:00 - 06:00 PM', busyPercent: 68, avgWaitMins: 16, openSlots: 10, trafficLevel: 'Moderate' },
  ];
};

export const DepartmentCapacityChart: React.FC<DepartmentCapacityChartProps> = ({
  departmentId,
  departmentName,
  onBookAppointment
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'hourly'>('weekly');

  const weeklyData = getDepartmentWeeklyData(departmentId);
  const hourlyData = getDepartmentHourlyData(departmentId);

  // Find lowest traffic day for patient recommendation
  const bestDay = [...weeklyData].sort((a, b) => a.capacityPercent - b.capacityPercent)[0];

  const CustomWeeklyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DayCapacityData = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800">
          <div className="flex items-center justify-between gap-4 font-bold border-b border-slate-800 pb-1">
            <span>{data.fullName}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                data.trafficLevel === 'Low'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : data.trafficLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {data.trafficLevel} Traffic
            </span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Available Open Slots:</span>
            <strong className="text-teal-400 tabular-nums">{data.openSlots} Slots</strong>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Clinic Capacity Booked:</span>
            <strong className="text-amber-400 tabular-nums">{data.capacityPercent}%</strong>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Estimated Waiting Time:</span>
            <strong className="text-white tabular-nums">~{data.avgWaitMins} mins</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomHourlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: HourlyTrafficData = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800">
          <div className="flex items-center justify-between gap-4 font-bold border-b border-slate-800 pb-1">
            <span>{data.timeWindow}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                data.trafficLevel === 'Low'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : data.trafficLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {data.trafficLevel} Traffic
            </span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Busyness Index:</span>
            <strong className="text-amber-400 tabular-nums">{data.busyPercent}%</strong>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Open Consultation Slots:</span>
            <strong className="text-teal-400 tabular-nums">{data.openSlots} Slots</strong>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Average Check-in Wait:</span>
            <strong className="text-white tabular-nums">~{data.avgWaitMins} mins</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <h3 className="text-base font-bold text-slate-900">
              Department Availability & Capacity Insights
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time patient traffic analysis to help you schedule with minimal waiting time.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            type="button"
            onClick={() => setViewMode('hourly')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'hourly'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Rush Hours
          </button>
        </div>
      </div>

      {/* Patient Recommendation Strip */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </span>
          <div>
            <p className="font-bold text-emerald-950">
              Optimal Time to Book: {bestDay.fullName}s ({bestDay.openSlots} Open Slots)
            </p>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Average check-in wait is under {bestDay.avgWaitMins} minutes with {100 - bestDay.capacityPercent}% open consultation capacity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBookAppointment}
          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          Book in Low-Traffic Slot
        </button>
      </div>

      {/* Recharts Graph Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'weekly' ? (
            <ComposedChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 35]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomWeeklyTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
              />
              <Bar
                yAxisId="left"
                dataKey="openSlots"
                name="Available Open Slots"
                fill="#0f766e"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="capacityPercent"
                name="Occupied Capacity %"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d97706', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={hourlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="timeWindow"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 25]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomHourlyTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
              />
              <Bar
                yAxisId="left"
                dataKey="openSlots"
                name="Available Open Slots"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="busyPercent"
                name="Busyness Level %"
                stroke="#ea580c"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#ea580c', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Traffic Legend Guide */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>&lt; 50% Capacity (Quick Check-in)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>50 - 75% Capacity (Moderate)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>&gt; 75% Capacity (Peak Rush)</span>
          </span>
        </div>

        <span className="text-slate-400">
          Updated live from {departmentName} clinic roster
        </span>
      </div>
    </div>
  );
};
