import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  LifeBuoy,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UnlockKeyhole,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminVerificationPage } from './AdminVerificationPage';
import { useAuth } from '../context/AuthContext';
import { sqlApi } from '../lib/sqlClient';
import { AdminDashboardData, AdminSupportTicket, Appointment, SupportTicketStatus } from '../types/hospital';

type DashboardSection = 'overview' | 'doctors' | 'approvals' | 'patients' | 'visits' | 'support';
type VisitFilter = 'upcoming' | 'past' | 'all';

const sectionTabs: { id: DashboardSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'approvals', label: 'Doctor approvals', icon: FileCheck2 },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'visits', label: 'Visits', icon: CalendarDays },
  { id: 'support', label: 'Support', icon: LifeBuoy },
];

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(value?: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusStyle(status: string) {
  if (status === 'Confirmed' || status === 'resolved' || status === 'approved') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Cancelled' || status === 'rejected') return 'bg-rose-50 text-rose-700';
  if (status === 'Completed') return 'bg-slate-100 text-slate-700';
  return 'bg-amber-50 text-amber-800';
}

interface AdminDashboardPageProps {
  onDoctorApproved?: () => void;
  onOpenAuth?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onDoctorApproved, onOpenAuth }) => {
  const { user, isAdmin } = useAuth();
  const [section, setSection] = useState<DashboardSection>('overview');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [visitFilter, setVisitFilter] = useState<VisitFilter>('upcoming');
  const [doctorView, setDoctorView] = useState<'roster' | 'accounts'>('roster');
  const [pendingApplications, setPendingApplications] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketBusy, setTicketBusy] = useState(false);
  const [accountActionUid, setAccountActionUid] = useState<string | null>(null);

  const refreshDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, applicationsResponse] = await Promise.all([
        sqlApi.getAdminDashboard(),
        sqlApi.getAllDoctorApplications(),
      ]);
      setData(dashboard);
      setPendingApplications((applicationsResponse.applications || []).filter((application: any) => application.status !== 'approved' && application.status !== 'rejected').length);
      setSelectedTicket((previous) => previous
        ? dashboard.supportTickets.find((ticket) => ticket.id === previous.id) || null
        : dashboard.supportTickets[0] || null);
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDashboard();
  }, []);

  const today = localDateKey(new Date());
  const appointments = data?.appointments || [];
  const upcomingVisits = appointments.filter((appointment) =>
    appointment.date >= today && appointment.status !== 'Cancelled' && appointment.status !== 'Completed'
  );
  const pastVisits = appointments.filter((appointment) =>
    appointment.date < today || appointment.status === 'Completed'
  );
  const todaysVisits = appointments.filter((appointment) => appointment.date === today && appointment.status !== 'Cancelled');
  const openTickets = (data?.supportTickets || []).filter((ticket) => ticket.status === 'open');

  const visitChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = localDateKey(date);
      return {
        date: key,
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        visits: appointments.filter((appointment) => appointment.date === key).length,
      };
    });
    return days;
  }, [appointments]);

  const filteredPatients = (data?.patients || []).filter((patient) => {
    const query = patientSearch.trim().toLowerCase();
    return !query || [patient.displayName, patient.email, patient.phone || ''].some((value) => value.toLowerCase().includes(query));
  });

  const filteredDoctors = (data?.doctors || []).filter((doctor) => {
    const query = doctorSearch.trim().toLowerCase();
    return !query || [doctor.name, doctor.departmentName, doctor.title].some((value) => value.toLowerCase().includes(query));
  });

  const visibleVisits = visitFilter === 'upcoming'
    ? upcomingVisits
    : visitFilter === 'past'
      ? pastVisits
      : appointments;

  const visibleTickets = (data?.supportTickets || []).filter((ticket) => {
    const query = ticketSearch.trim().toLowerCase();
    return !query || [ticket.id, ticket.userName, ticket.userEmail, ticket.category, ticket.message].some((value) => value.toLowerCase().includes(query));
  });

  const handleSelectTicket = async (ticket: AdminSupportTicket) => {
    setSelectedTicket(ticket);
    setTicketBusy(true);
    try {
      const response = await sqlApi.getSupportTicket(ticket.id);
      setSelectedTicket(response.ticket);
    } catch (ticketError: any) {
      setError(ticketError?.message || 'Unable to load the support attachment.');
    } finally {
      setTicketBusy(false);
    }
  };

  const handleTicketStatus = async (ticket: AdminSupportTicket, status: SupportTicketStatus) => {
    setTicketBusy(true);
    setError(null);
    try {
      const response = await sqlApi.updateSupportTicketStatus(ticket.id, status);
      setData((current) => current ? {
        ...current,
        supportTickets: current.supportTickets.map((item) => item.id === ticket.id ? response.ticket : item),
      } : current);
      setSelectedTicket((current) => current?.id === ticket.id ? { ...current, ...response.ticket } : current);
    } catch (ticketError: any) {
      setError(ticketError?.message || 'Unable to update this support ticket.');
    } finally {
      setTicketBusy(false);
    }
  };

  const handleAccountBlock = async (uid: string, isBlocked: boolean) => {
    if (isBlocked && !window.confirm('Block this account from signing in?')) {
      return;
    }

    setAccountActionUid(uid);
    setError(null);
    try {
      await sqlApi.setAccountBlocked(uid, isBlocked, user?.uid || '');
      setData((current) => current ? {
        ...current,
        patients: current.patients.map((patient) => patient.uid === uid ? { ...patient, isBlocked } : patient),
        doctorAccounts: current.doctorAccounts.map((account) => account.uid === uid ? { ...account, isBlocked } : account),
      } : current);
    } catch (blockError: any) {
      setError(blockError?.message || `Unable to ${isBlocked ? 'block' : 'unblock'} this account.`);
    } finally {
      setAccountActionUid(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Administrator access required</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in with the designated administrator account to open hospital operations.</p>
        {onOpenAuth && <button type="button" onClick={onOpenAuth} className="mt-5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">Admin sign in</button>}
      </div>
    );
  }

  const metricCards = [
    { label: 'Patients', value: data?.patients.length || 0, note: 'Registered accounts', icon: Users, color: 'text-cyan-700 bg-cyan-50' },
    { label: 'Doctors', value: data?.doctors.length || 0, note: `${pendingApplications} applications to review`, icon: Stethoscope, color: 'text-teal-700 bg-teal-50' },
    { label: "Today's visits", value: todaysVisits.length, note: `${upcomingVisits.length} upcoming overall`, icon: CalendarDays, color: 'text-blue-700 bg-blue-50' },
    { label: 'Open tickets', value: openTickets.length, note: 'Awaiting support resolution', icon: LifeBuoy, color: 'text-amber-700 bg-amber-50' },
  ];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                <ShieldCheck className="h-4 w-4" /> Hospital Operations
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">Admin dashboard</h1>
              <p className="mt-1 text-xs text-slate-500">Live clinic activity, people, doctor approvals, and support.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-semibold text-slate-800">{user?.displayName || 'Administrator'}</span>
                <span className="block text-[10px] text-slate-500">{user?.email}</span>
              </span>
              <button type="button" onClick={() => void refreshDashboard()} disabled={loading} aria-label="Refresh dashboard" title="Refresh dashboard" className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <nav aria-label="Admin sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
            {sectionTabs.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setSection(id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition ${section === id ? 'border-amber-600 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Icon className="h-4 w-4" />{label}
                {id === 'approvals' && pendingApplications > 0 && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">{pendingApplications}</span>}
                {id === 'support' && openTickets.length > 0 && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">{openTickets.length}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <span className="inline-flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span>
            <button type="button" onClick={() => setError(null)} className="font-semibold">Dismiss</button>
          </div>
        )}

        {loading && !data ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500"><RefreshCw className="h-5 w-5 animate-spin text-amber-600" />Loading hospital data...</div>
        ) : !data ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-800">Dashboard data is unavailable.</p>
            <button type="button" onClick={() => void refreshDashboard()} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Try again</button>
          </div>
        ) : (
          <>
            {section === 'overview' && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {metricCards.map(({ label, value, note, icon: Icon, color }) => (
                    <button key={label} type="button" onClick={() => setSection(label === 'Patients' ? 'patients' : label === 'Doctors' ? 'doctors' : label === 'Open tickets' ? 'support' : 'visits')} className="flex min-h-28 items-start justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm">
                      <span>
                        <span className="block text-xs font-medium text-slate-500">{label}</span>
                        <span className="mt-2 block text-3xl font-bold tabular-nums text-slate-950">{value}</span>
                        <span className="mt-1 block text-[10px] text-slate-500">{note}</span>
                      </span>
                      <span className={`rounded-lg p-2 ${color}`}><Icon className="h-4 w-4" /></span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
                  <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><h2 className="text-sm font-bold text-slate-900">Visit activity</h2><p className="mt-1 text-[11px] text-slate-500">Scheduled visits by date · last 7 days</p></div>
                      <Activity className="h-4 w-4 text-teal-700" />
                    </div>
                    <div className="mt-4 h-60 w-full" role="img" aria-label="Bar chart of appointments by day">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={visitChartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }} />
                          <Bar dataKey="visits" name="Visits" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div><h2 className="text-sm font-bold text-slate-900">Support queue</h2><p className="mt-1 text-[11px] text-slate-500">{openTickets.length} tickets need action</p></div>
                      <button type="button" onClick={() => setSection('support')} className="text-xs font-semibold text-teal-700 hover:text-teal-900">Open queue</button>
                    </div>
                    <div className="mt-4 divide-y divide-slate-100">
                      {openTickets.slice(0, 5).map((ticket) => (
                        <button key={ticket.id} type="button" onClick={() => { setSection('support'); void handleSelectTicket(ticket); }} className="block w-full py-3 text-left first:pt-0 hover:bg-slate-50">
                          <span className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-800">{ticket.category}</span><span className="font-mono text-[10px] text-slate-400">{ticket.id}</span></span>
                          <span className="mt-1 block truncate text-[11px] text-slate-600">{ticket.message}</span>
                          <span className="mt-1 block text-[10px] text-slate-400">{ticket.userName} · {formatDate(ticket.createdAt)}</span>
                        </button>
                      ))}
                      {openTickets.length === 0 && <p className="py-8 text-center text-xs text-slate-500">No open support tickets.</p>}
                    </div>
                  </section>
                </div>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                    <div><h2 className="text-sm font-bold text-slate-900">Next visits</h2><p className="mt-0.5 text-[11px] text-slate-500">Upcoming confirmed and pending appointments</p></div>
                    <button type="button" onClick={() => { setVisitFilter('upcoming'); setSection('visits'); }} className="text-xs font-semibold text-teal-700">All visits</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-2.5">Patient</th><th className="px-4 py-2.5">Doctor</th><th className="px-4 py-2.5">Visit</th><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Status</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {upcomingVisits.slice(0, 6).map((appointment) => <VisitRow key={appointment.id} appointment={appointment} />)}
                        {upcomingVisits.length === 0 && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No upcoming visits.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {section === 'doctors' && (
              doctorView === 'accounts' ? (
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Doctor account access</h2>
                      <p className="mt-1 text-[11px] text-slate-500">Block or restore sign-in for linked doctor accounts.</p>
                    </div>
                    <button type="button" onClick={() => setDoctorView('roster')} className="text-xs font-semibold text-teal-700 hover:text-teal-900">Doctor roster</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Doctor account</th><th className="px-4 py-3">Login email</th><th className="px-4 py-3">Credential status</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Action</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.doctorAccounts.map((account) => <tr key={account.uid} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><span className="block font-semibold text-slate-800">{account.displayName || 'Doctor account'}</span><span className="mt-0.5 block font-mono text-[10px] text-slate-400">{account.uid}</span></td>
                          <td className="px-4 py-3 text-slate-600">{account.email || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{account.verificationStatus?.replace('_', ' ') || 'Not linked'}</td>
                          <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${account.isBlocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{account.isBlocked ? 'Blocked' : 'Active'}</span></td>
                          <td className="px-4 py-3"><button type="button" onClick={() => void handleAccountBlock(account.uid, !account.isBlocked)} disabled={accountActionUid === account.uid} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold disabled:opacity-50 ${account.isBlocked ? 'border border-slate-200 text-slate-700 hover:bg-slate-100' : 'border border-rose-200 text-rose-700 hover:bg-rose-50'}`}>{account.isBlocked ? <UnlockKeyhole className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}{accountActionUid === account.uid ? 'Saving...' : account.isBlocked ? 'Unblock' : 'Block'}</button></td>
                        </tr>)}
                        {data.doctorAccounts.length === 0 && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No linked doctor login accounts are available to manage.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : (
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div><h2 className="text-sm font-bold text-slate-900">Doctor roster</h2><p className="mt-1 text-[11px] text-slate-500">{filteredDoctors.length} registered doctors</p></div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <label className="relative block"><span className="sr-only">Search doctors</span><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={doctorSearch} onChange={(event) => setDoctorSearch(event.target.value)} placeholder="Search doctors" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-teal-500 sm:w-52" /></label>
                      <button type="button" onClick={() => setDoctorView('accounts')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><LockKeyhole className="h-3.5 w-3.5" />Doctor accounts <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">{data.doctorAccounts.length}</span></button>
                      <button type="button" onClick={() => setSection('approvals')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"><FileCheck2 className="h-3.5 w-3.5" />Doctor approvals{pendingApplications > 0 && <span className="rounded bg-white/15 px-1.5 py-0.5">{pendingApplications}</span>}</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Doctor</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Consultation</th><th className="px-4 py-3">Status</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDoctors.map((doctor) => <tr key={doctor.id} className="hover:bg-slate-50"><td className="px-4 py-3"><span className="block font-semibold text-slate-800">{doctor.name}</span><span className="mt-0.5 block text-[10px] text-slate-500">{doctor.title}</span></td><td className="px-4 py-3 text-slate-600">{doctor.departmentName}</td><td className="px-4 py-3 text-slate-600">{doctor.experienceYears} years</td><td className="px-4 py-3 text-slate-600">${doctor.consultationFee}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${doctor.verifiedByAdmin ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{doctor.verifiedByAdmin ? 'Verified' : 'Review'}</span></td></tr>)}
                        {filteredDoctors.length === 0 && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No doctors match this search.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
            )}

            {section === 'approvals' && (
              <AdminVerificationPage onDoctorApproved={() => { void refreshDashboard(); onDoctorApproved?.(); }} onOpenAuth={onOpenAuth} />
            )}

            {section === 'patients' && (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div><h2 className="text-sm font-bold text-slate-900">Patient directory</h2><p className="mt-1 text-[11px] text-slate-500">{filteredPatients.length} patient accounts</p></div>
                  <label className="relative block"><span className="sr-only">Search patients</span><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} placeholder="Name, email, or phone" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-teal-500 sm:w-64" /></label>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Action</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPatients.map((patient) => <tr key={patient.uid} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-800">{patient.displayName || 'Patient'}</td><td className="px-4 py-3 text-slate-600">{patient.email || '—'}</td><td className="px-4 py-3 text-slate-600">{patient.phone || '—'}</td><td className="px-4 py-3 text-slate-500">{formatDate(patient.createdAt)}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${patient.isBlocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{patient.isBlocked ? 'Blocked' : 'Active'}</span></td><td className="px-4 py-3"><button type="button" onClick={() => void handleAccountBlock(patient.uid, !patient.isBlocked)} disabled={accountActionUid === patient.uid} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold disabled:opacity-50 ${patient.isBlocked ? 'border border-slate-200 text-slate-700 hover:bg-slate-100' : 'border border-rose-200 text-rose-700 hover:bg-rose-50'}`}>{patient.isBlocked ? <UnlockKeyhole className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}{accountActionUid === patient.uid ? 'Saving...' : patient.isBlocked ? 'Unblock' : 'Block'}</button></td></tr>)}
                      {filteredPatients.length === 0 && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>No patients found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {section === 'visits' && (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div><h2 className="text-sm font-bold text-slate-900">Visit records</h2><p className="mt-1 text-[11px] text-slate-500">Live, upcoming, and historical appointments</p></div>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {([['upcoming', 'Live & upcoming'], ['past', 'Past'], ['all', 'All visits']] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setVisitFilter(id)} aria-pressed={visitFilter === id} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${visitFilter === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{label}</button>)}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Doctor / Department</th><th className="px-4 py-3">Visit reason</th><th className="px-4 py-3">Date & time</th><th className="px-4 py-3">Status</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleVisits.map((appointment) => <VisitRow key={appointment.id} appointment={appointment} showReason />)}
                      {visibleVisits.length === 0 && <tr><td className="px-4 py-10 text-center text-slate-500" colSpan={5}>No visits in this view.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {section === 'support' && (
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 p-4">
                    <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900">Support tickets</h2><p className="mt-1 text-[11px] text-slate-500">{openTickets.length} open · {(data.supportTickets || []).length} total</p></div><LifeBuoy className="h-4 w-4 text-amber-700" /></div>
                    <label className="relative mt-3 block"><span className="sr-only">Search tickets</span><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={ticketSearch} onChange={(event) => setTicketSearch(event.target.value)} placeholder="Search tickets" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-teal-500" /></label>
                  </div>
                  <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto">
                    {visibleTickets.map((ticket) => <button key={ticket.id} type="button" onClick={() => void handleSelectTicket(ticket)} className={`block w-full border-l-2 p-4 text-left transition hover:bg-slate-50 ${selectedTicket?.id === ticket.id ? 'border-teal-700 bg-teal-50/50' : 'border-transparent'}`}>
                      <span className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-800">{ticket.category}</span><span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusStyle(ticket.status)}`}>{ticket.status}</span></span>
                      <span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-slate-600">{ticket.message}</span>
                      <span className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400"><span>{ticket.userName} · {ticket.userRole}</span><span>{formatDate(ticket.createdAt)}</span></span>
                    </button>)}
                    {visibleTickets.length === 0 && <p className="px-4 py-10 text-center text-xs text-slate-500">No tickets found.</p>}
                  </div>
                </div>

                <div className="min-h-[320px] rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                  {selectedTicket ? (
                    <>
                      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-bold text-slate-900">{selectedTicket.category}</h3><span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${statusStyle(selectedTicket.status)}`}>{selectedTicket.status}</span></div><p className="mt-1 font-mono text-[10px] text-slate-500">{selectedTicket.id}</p></div>
                        <button type="button" onClick={() => void handleTicketStatus(selectedTicket, selectedTicket.status === 'open' ? 'resolved' : 'open')} disabled={ticketBusy} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${selectedTicket.status === 'open' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-700 hover:bg-slate-800'}`}>
                          {selectedTicket.status === 'open' ? <><Check className="h-3.5 w-3.5" />Mark resolved</> : <><RefreshCw className="h-3.5 w-3.5" />Reopen ticket</>}
                        </button>
                      </div>
                      <dl className="grid grid-cols-1 gap-3 border-b border-slate-100 py-4 text-xs sm:grid-cols-2">
                        <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Submitted by</dt><dd className="mt-1 font-semibold text-slate-800">{selectedTicket.userName} <span className="font-normal capitalize text-slate-500">({selectedTicket.userRole})</span></dd></div>
                        <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Contact</dt><dd className="mt-1 break-all text-slate-700">{selectedTicket.userEmail}</dd></div>
                        <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Received</dt><dd className="mt-1 text-slate-700">{formatDate(selectedTicket.createdAt)}</dd></div>
                        {selectedTicket.resolvedAt && <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Resolved</dt><dd className="mt-1 text-slate-700">{formatDate(selectedTicket.resolvedAt)}</dd></div>}
                      </dl>
                      <div className="py-4"><h4 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Problem description</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedTicket.message}</p></div>
                      <div className="border-t border-slate-100 pt-4"><h4 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Attachment</h4>{ticketBusy ? <p className="text-xs text-slate-500">Loading attachment...</p> : selectedTicket.imageDataUrl ? <a href={selectedTicket.imageDataUrl} target="_blank" rel="noreferrer"><img src={selectedTicket.imageDataUrl} alt={`Support attachment for ${selectedTicket.id}`} className="max-h-[360px] max-w-full rounded-lg border border-slate-200 object-contain" /></a> : <p className="text-xs text-slate-500">No attachment loaded.</p>}</div>
                    </>
                  ) : <div className="flex h-full min-h-64 flex-col items-center justify-center text-center"><LifeBuoy className="h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">Select a ticket</p><p className="mt-1 text-xs text-slate-500">Ticket details and attachments will appear here.</p></div>}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

function VisitRow({ appointment, showReason = false }: { appointment: Appointment; showReason?: boolean }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3"><span className="block font-semibold text-slate-800">{appointment.patientName}</span><span className="mt-0.5 block text-[10px] text-slate-500">{appointment.patientPhone}</span></td>
      <td className="px-4 py-3"><span className="block font-medium text-slate-800">{appointment.doctorName}</span><span className="mt-0.5 block text-[10px] text-slate-500">{appointment.departmentName}</span></td>
      {showReason && <td className="max-w-60 px-4 py-3 text-slate-600"><span className="line-clamp-2">{appointment.reasonForVisit}</span></td>}
      {!showReason && <td className="px-4 py-3 text-slate-600">{appointment.appointmentType}</td>}
      <td className="px-4 py-3 text-slate-600"><span className="block">{formatDate(appointment.date)}</span><span className="mt-0.5 block text-[10px] text-slate-500">{appointment.timeSlot}</span></td>
      <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${statusStyle(appointment.status)}`}>{appointment.status}</span></td>
    </tr>
  );
}