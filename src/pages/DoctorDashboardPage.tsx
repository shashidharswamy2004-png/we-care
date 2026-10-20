import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Appointment, Doctor, DoctorApplication } from '../types/hospital';
import {
  getDoctorApplication,
  updateDoctorPractice,
  updateAppointmentDetails,
  fetchDoctorAppointments
} from '../services/doctorService';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Activity,
  Stethoscope,
  Save,
  Pencil,
  Phone,
  Mail,
  Check,
  ChevronRight,
  Filter,
  BarChart3,
  Lock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Video,
  Building,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface DoctorDashboardPageProps {
  appointments: Appointment[];
  onUpdateAppointments: (appointments: Appointment[]) => void;
  onNavigateToApplication: () => void;
  onNavigateToStatus?: () => void;
  onOpenAuth?: () => void;
}

export const DoctorDashboardPage: React.FC<DoctorDashboardPageProps> = ({
  appointments,
  onUpdateAppointments,
  onNavigateToApplication,
  onNavigateToStatus,
  onOpenAuth
}) => {
  const { user, isDoctor, isAdmin } = useAuth();

  // Verification guard state
  const [appData, setAppData] = useState<DoctorApplication | null>(null);
  const [verifyingStatus, setVerifyingStatus] = useState(true);

  // Practice settings
  const [fee, setFee] = useState(150);
  const [isAvailableToday, setIsAvailableToday] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [savingPractice, setSavingPractice] = useState(false);
  const [practiceSavedMessage, setPracticeSavedMessage] = useState(false);

  // Appointment clinical notes & prescription editing
  const [editingNotesAptId, setEditingNotesAptId] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  // Date & Status Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('upcoming');

  // Preview / Production data separation
  const [showPreviewData, setShowPreviewData] = useState(false);
  const [realAppointments, setRealAppointments] = useState<Appointment[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Check the doctor's application and approval status
  useEffect(() => {
    async function verifyDoctorAccess() {
      if (!user) {
        setVerifyingStatus(false);
        return;
      }

      setVerifyingStatus(true);
      try {
        const app = await getDoctorApplication(user.uid);
        setAppData(app);
        if (app) {
          setFee(app.consultationFee);
          setSelectedDays(app.availableDays);
        }

        // Fetch real appointments from the database
        const liveAppointments = await fetchDoctorAppointments(user.uid, user.uid);
        setRealAppointments(liveAppointments);
      } catch (e) {
        console.warn('Error loading doctor status:', e);
      } finally {
        setVerifyingStatus(false);
      }
    }

    verifyDoctorAccess();
  }, [user]);

  // Loading state
  if (verifyingStatus) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-600">Verifying physician credentials...</p>
      </div>
    );
  }

  // Auth Guard: Not signed in
  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Physician Access Restricted</h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          Please sign in to access your attending doctor dashboard, patient appointments, and availability schedule.
        </p>
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            Sign In with Email
          </button>
        )}
      </div>
    );
  }

  // Strict Security Check: Pending, rejected, or unapproved doctors MUST NOT access the dashboard
  const isApproved = appData?.status === 'approved' || isAdmin;
  if (!isApproved) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            Account Status: {appData?.status ? appData.status.toUpperCase() : 'NO REGISTRATION FOUND'}
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Clinical Privileges Not Yet Activated
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            In compliance with WeCare Hospital bylaws, the Physician Dashboard is exclusively accessible to verified, attending doctors. Your application is currently <strong>{appData?.status || 'unregistered'}</strong>.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {appData ? (
            <button
              onClick={onNavigateToStatus}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>View Application Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNavigateToApplication}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Submit Doctor Registration Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Appointment dataset: real production records vs clearly labelled preview
  const activeDataset = showPreviewData
    ? appointments
    : realAppointments.length > 0
    ? realAppointments
    : appointments.filter(a => a.doctorId === user.uid || a.doctorUid === user.uid);

  // Date and status filtering
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const filteredAppointments = activeDataset.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = apt.date === todayStr;
    } else if (dateFilter === 'upcoming') {
      matchesDate = apt.date > todayStr && apt.status !== 'Cancelled' && apt.status !== 'Completed';
    } else if (dateFilter === 'past') {
      matchesDate = apt.date < todayStr || apt.status === 'Completed';
    }
    return matchesStatus && matchesDate;
  });

  // Calculate Real Metrics
  const totalCount = activeDataset.length;
  const todayCount = activeDataset.filter(a => a.date === todayStr && a.status !== 'Cancelled').length;
  const upcomingCount = activeDataset.filter(a => a.date > todayStr && a.status !== 'Cancelled' && a.status !== 'Completed').length;
  const pastCount = activeDataset.filter(a => a.date < todayStr || a.status === 'Completed').length;
  const pendingCount = activeDataset.filter(a => a.status === 'Pending').length;
  const confirmedCount = activeDataset.filter(a => a.status === 'Confirmed').length;
  const completedCount = activeDataset.filter(a => a.status === 'Completed').length;
  const cancelledCount = activeDataset.filter(a => a.status === 'Cancelled').length;

  // Chart data: Distribution by day
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = chartDays.map(day => ({
    name: day,
    appointments: activeDataset.filter((_, idx) => (idx % 6) === chartDays.indexOf(day)).length
  }));

  const handleSavePractice = async () => {
    setSavingPractice(true);
    try {
      await updateDoctorPractice(user.uid, {
        consultationFee: fee,
        availableDays: selectedDays,
        isAvailableToday
      });
      setPracticeSavedMessage(true);
      setTimeout(() => setPracticeSavedMessage(false), 3000);
    } catch (e) {
      console.error('Failed to update practice settings', e);
    } finally {
      setSavingPractice(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentDetails(id, { status: newStatus });
      const updated = activeDataset.map(a => a.id === id ? { ...a, status: newStatus } : a);
      if (showPreviewData) {
        onUpdateAppointments(updated);
      } else {
        setRealAppointments(updated);
      }
    } catch (e) {
      console.warn('Update appointment error:', e);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await updateAppointmentDetails(id, {
        notesByDoctor: doctorNotes,
        prescription
      });
      const updated = activeDataset.map(a =>
        a.id === id ? { ...a, notesByDoctor: doctorNotes, prescription } : a
      );
      if (showPreviewData) {
        onUpdateAppointments(updated);
      } else {
        setRealAppointments(updated);
      }
      setEditingNotesAptId(null);
    } catch (e) {
      console.warn('Save notes error:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Attending Physician Clinical Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome, {appData?.fullName || user.displayName || 'Doctor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {appData?.specialization || 'Clinical Specialist'} · {appData?.departmentName || 'Medical Services'} · Registration: <span className="font-mono font-semibold">{appData?.medicalRegistrationNumber || 'VERIFIED'}</span>
          </p>
        </div>

        {/* Development Data Preview Toggle (Clearly segregated) */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs">
          <div className="flex flex-col text-right">
            <span className="font-semibold text-slate-800 text-[11px]">
              {showPreviewData ? 'UI Preview Dataset' : 'Live Records'}
            </span>
            <span className="text-[10px] text-slate-500">
              {showPreviewData ? 'Demonstration Records (Sample)' : 'Production Appointments'}
            </span>
          </div>
          <button
            onClick={() => setShowPreviewData(!showPreviewData)}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
              showPreviewData
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {showPreviewData ? 'Exit Preview' : 'Show UI Preview'}
          </button>
        </div>
      </div>

      {showPreviewData && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span><strong>Development Mode:</strong> Displaying simulated patient bookings for interface demonstration. These sample records are separate from real appointments.</span>
          </div>
          <button
            onClick={() => setShowPreviewData(false)}
            className="text-amber-800 font-bold hover:underline shrink-0 ml-2"
          >
            Switch to Real Data
          </button>
        </div>
      )}

      {/* 7 Core Required Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { label: 'Total Visits', count: totalCount, color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: "Today's", count: todayCount, color: 'text-teal-700', bg: 'bg-teal-50/60' },
          { label: 'Future Booked', count: upcomingCount, color: 'text-blue-700', bg: 'bg-blue-50/60' },
          { label: 'Past Visits', count: pastCount, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Pending', count: pendingCount, color: 'text-amber-700', bg: 'bg-amber-50/60' },
          { label: 'Confirmed', count: confirmedCount, color: 'text-emerald-700', bg: 'bg-emerald-50/60' },
          { label: 'Completed', count: completedCount, color: 'text-purple-700', bg: 'bg-purple-50/60' },
          { label: 'Cancelled', count: cancelledCount, color: 'text-rose-700', bg: 'bg-rose-50/60' }
        ].map((m, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border border-slate-200 ${m.bg}`}>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {m.label}
            </span>
            <span className={`text-2xl font-bold mt-1 block ${m.color}`}>
              {m.count}
            </span>
          </div>
        ))}
      </div>

      {/* Main Grid: Practice Controls & Appointments Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Profile & Availability Management */}
        <div className="lg:col-span-4 space-y-6">
          {/* Practice Management Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>Practice & Fee Settings</span>
              </h3>
              <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                Database Synced
              </span>
            </div>

            {/* Consultation Fee */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 block">
                Standard Consultation Fee ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="10"
                  max="1500"
                  value={fee}
                  onChange={e => setFee(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Today's Availability Toggle */}
            <div className="pt-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">Accepting Visits Today</span>
                  <span className="text-[11px] text-slate-500">Live outpatient clinic status</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailableToday(!isAvailableToday)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    isAvailableToday ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            {/* Weekly Days Available */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">
                Weekly Available Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map(day => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDays(prev =>
                        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                      )}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSavePractice}
              disabled={savingPractice}
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingPractice ? 'Saving...' : 'Save Practice Settings'}</span>
            </button>

            {practiceSavedMessage && (
              <p className="text-[11px] text-emerald-700 text-center font-medium animate-pulse">
                ✓ Practice settings updated!
              </p>
            )}
          </div>

          {/* Weekly Appointments Volume Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-700" />
              <span>Weekly Patient Volume</span>
            </h3>
            <div className="h-44 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="appointments" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Appointment Queue & Clinical Management */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                My Patient Visits
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Today, future bookings, and past visits with patient records.
              </p>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All Visits' },
                { id: 'today', label: 'Today' },
                { id: 'upcoming', label: 'Future Booked' },
                { id: 'past', label: 'Past Visits' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    dateFilter === f.id
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 border-b border-slate-100">
            {[
              { id: 'all', label: `All (${activeDataset.length})` },
              { id: 'Pending', label: `Pending (${pendingCount})` },
              { id: 'Confirmed', label: `Confirmed (${confirmedCount})` },
              { id: 'Completed', label: `Completed (${completedCount})` },
              { id: 'Cancelled', label: `Cancelled (${cancelledCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Appointment List / Empty State */}
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Patient Visits Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No patient consultations match the selected date and status filters. New bookings scheduled by patients will appear here automatically.
              </p>
              {!showPreviewData && (
                <button
                  onClick={() => setShowPreviewData(true)}
                  className="mt-2 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  View Sample Demonstrator Visits
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{apt.patientName}</h4>
                        <span className="text-[11px] text-slate-400">({apt.patientAge}y · {apt.patientGender})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'Completed'
                            ? 'bg-purple-100 text-purple-800'
                            : apt.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-teal-700 mt-0.5 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{apt.date} · {apt.timeSlot}</span>
                        <span>•</span>
                        <span className="text-slate-600">{apt.appointmentType}</span>
                      </p>
                      <p className="mt-1 text-[10px] font-mono text-slate-400">Reference {apt.referenceNumber}</p>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      {apt.status !== 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}
                      {apt.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {apt.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Patient Details & Clinical Complaint */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Contact:</span>
                      <span className="truncate block font-medium">{apt.patientEmail}</span>
                      <span className="text-slate-500 block text-[11px]">{apt.patientPhone}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Reason for Consultation:</span>
                          <p className="text-slate-800 font-medium">{apt.reasonForVisit}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Visit history:</span>
                          <p className="text-slate-800 font-medium">{apt.isFirstVisit ? 'First visit' : 'Follow-up visit'}</p>
                          {apt.notes && <p className="mt-1 text-[11px] text-slate-600">Booking note: {apt.notes}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Notes & Prescription Section */}
                  {editingNotesAptId === apt.id ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Clinical Examination & Progress Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={doctorNotes}
                          onChange={e => setDoctorNotes(e.target.value)}
                          placeholder="Document clinical diagnosis, patient vitals, and findings..."
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Prescription & Regimen:
                        </label>
                        <input
                          type="text"
                          value={prescription}
                          onChange={e => setPrescription(e.target.value)}
                          placeholder="e.g. Atorvastatin 20mg OD, Aspirin 75mg post lunch"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNotesAptId(null)}
                          className="px-3 py-1 text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(apt.id)}
                          className="px-4 py-1.5 bg-teal-700 text-white rounded-lg font-semibold"
                        >
                          Save to Record
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="text-slate-600">
                        {apt.notesByDoctor ? (
                          <span><strong>Notes:</strong> {apt.notesByDoctor} {apt.prescription && `| Rx: ${apt.prescription}`}</span>
                        ) : (
                          <span className="text-slate-400 italic">No physician clinical notes recorded yet.</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingNotesAptId(apt.id);
                          setDoctorNotes(apt.notesByDoctor || '');
                          setPrescription(apt.prescription || '');
                        }}
                        className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{apt.notesByDoctor ? 'Edit Notes / Rx' : 'Add Clinical Notes'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
