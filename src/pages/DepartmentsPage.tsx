import React, { useState } from 'react';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { Department, Doctor } from '../types/hospital';
import {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Activity,
  ShieldCheck,
  Ambulance,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  MapPin,
  ChevronRight,
  Search,
  UserCheck
} from 'lucide-react';
import { DepartmentCapacityChart } from '../components/DepartmentCapacityChart';

interface DepartmentsPageProps {
  selectedDeptId?: string | null;
  allDoctors?: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  onBookWithDoctor: (deptId: string, doctorId: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  selectedDeptId: initialSelectedDeptId,
  allDoctors = DOCTORS,
  onSelectDoctor,
  onBookWithDoctor
}) => {
  const [activeDeptId, setActiveDeptId] = useState<string>(
    initialSelectedDeptId || DEPARTMENTS[0].id
  );
  const [searchTerm, setSearchTerm] = useState('');

  const activeDept = DEPARTMENTS.find((d) => d.id === activeDeptId) || DEPARTMENTS[0];
  const departmentDoctors = allDoctors.filter((doc) => doc.departmentId === activeDept.id);

  // Filtered departments for navigation sidebar
  const filteredDepartments = DEPARTMENTS.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.conditionsTreated.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-teal-700" />;
      case 'Brain': return <Brain className="w-5 h-5 text-teal-700" />;
      case 'Bone': return <Bone className="w-5 h-5 text-teal-700" />;
      case 'Baby': return <Baby className="w-5 h-5 text-teal-700" />;
      case 'Activity': return <Activity className="w-5 h-5 text-teal-700" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-teal-700" />;
      case 'Ambulance': return <Ambulance className="w-5 h-5 text-teal-700" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-700" />;
      default: return <Stethoscope className="w-5 h-5 text-teal-700" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
          Clinical Excellence Centers
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Medical Departments & Specialty Institutes
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          WeCare Hospital houses specialized clinical departments staffed by distinguished faculty, equipped with advanced diagnostic suites and dedicated inpatient beds.
        </p>
      </div>

      {/* Main Grid: Department Selector (Left) + Detailed View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Department List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter departments or conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredDepartments.map((dept) => {
              const isActive = activeDeptId === dept.id;
              const docCount = allDoctors.filter((d) => d.departmentId === dept.id).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setActiveDeptId(dept.id);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-teal-50/80 border-l-4 border-l-teal-700 text-teal-950 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {getDeptIcon(dept.iconName)}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight line-clamp-1">{dept.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{docCount} Multiple Doctors</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Department Detail */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Department Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  {getDeptIcon(activeDept.iconName)}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{activeDept.name}</h2>
                  <p className="text-xs text-teal-700 font-semibold mt-0.5">{activeDept.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>{activeDept.floor}</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {activeDept.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Key Services */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Clinical Interventions & Procedures</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  {activeDept.keyServices.map((srv, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-700 font-bold">·</span>
                      <span>{srv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conditions Treated */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-700" />
                  <span>Conditions Evaluated & Treated</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  {activeDept.conditionsTreated.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-700 font-bold">·</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Department Weekly Capacity & Availability Graph */}
          <DepartmentCapacityChart
            departmentId={activeDept.id}
            departmentName={activeDept.name}
            onBookAppointment={() => onBookWithDoctor(activeDept.id, activeDept.doctorIds[0])}
          />

          {/* Department Doctors Section (Multiple Doctors) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Specialist Physicians in {activeDept.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Multiple attending consultants, sub-specialists, and surgeons available for appointment.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                {departmentDoctors.length} Faculty Members
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-inner">
                        {doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                        <p className="text-xs text-teal-700 font-medium leading-snug">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span className="tabular-nums text-slate-800">{doc.rating.toFixed(2)}</span>
                          </span>
                          <span>·</span>
                          <span>{doc.experienceYears} yrs experience</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.about}
                    </p>

                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <p>
                        <span className="font-semibold text-slate-700">Days:</span> {doc.availableDays.join(', ')}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Fee:</span> ${doc.consultationFee}
                        <span className="text-slate-400"> · Languages: {doc.languages.join(', ')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      Doctor Profile
                    </button>
                    <button
                      onClick={() => onBookWithDoctor(activeDept.id, doc.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Book with {doc.name.split(' ')[1] || doc.name}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
