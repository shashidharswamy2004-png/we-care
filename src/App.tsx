/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { Footer } from './components/Footer';
import { EmergencyBanner } from './components/EmergencyBanner';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorApplicationPage } from './pages/DoctorApplicationPage';
import { DoctorApplicationStatusPage } from './pages/DoctorApplicationStatusPage';
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { BookingModal } from './components/BookingModal';
import { MyAppointmentsModal } from './components/MyAppointmentsModal';
import { AppointmentTicket } from './components/AppointmentTicket';
import { AuthModal } from './components/AuthModal';
import { SupportTicketModal } from './components/SupportTicketModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Appointment, Doctor } from './types/hospital';
import { DOCTORS } from './data/hospitalData';
import { fetchVerifiedDoctors, updateAppointmentDetails } from './services/doctorService';
import { LifeBuoy, LogOut, ShieldCheck } from 'lucide-react';

function getUserAppointmentsKey(userId?: string) {
  return userId ? `wecare_hospital_appointments_${userId}` : 'wecare_hospital_guest_appointments_v1';
}

function AppContent() {
  const { user, isAdmin, isDoctor, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedDeptIdForPage, setSelectedDeptIdForPage] = useState<string | null>(null);
  const [customDoctors, setCustomDoctors] = useState<Doctor[]>([]);

  // Load verified custom doctors from the database
  const loadCustomDoctors = async () => {
    try {
      const verified = await fetchVerifiedDoctors();
      setCustomDoctors(verified);
    } catch (e) {
      console.warn('Could not load custom doctors:', e);
    }
  };

  useEffect(() => {
    loadCustomDoctors();
  }, []);

  const allDoctors = [
    ...customDoctors,
    ...DOCTORS.filter(d => !customDoctors.some(c => c.id === d.id))
  ];

  // Appointments State with user-specific local storage persistence
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadedAppointmentsKey, setLoadedAppointmentsKey] = useState<string | null>(null);
  const appointmentsKey = getUserAppointmentsKey(user?.uid);

  useEffect(() => {
    let storedAppointments: Appointment[] = [];
    try {
      const stored = localStorage.getItem(appointmentsKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Appointment[];
        if (Array.isArray(parsed)) {
          storedAppointments = parsed.filter((appointment) =>
            user?.uid ? appointment.patientUid === user.uid : !appointment.patientUid
          );
        }
      }
    } catch (e) {
      console.error('Failed to parse appointments from localStorage', e);
    }

    setAppointments(storedAppointments);
    setLoadedAppointmentsKey(appointmentsKey);
  }, [appointmentsKey, user?.uid]);

  useEffect(() => {
    if (loadedAppointmentsKey !== appointmentsKey) {
      return;
    }

    try {
      localStorage.setItem(appointmentsKey, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments to localStorage', e);
    }
  }, [appointments, appointmentsKey, loadedAppointmentsKey]);

  const visibleAppointments = user
    ? appointments.filter((appointment) => appointment.patientUid === user.uid)
    : appointments.filter((appointment) => !appointment.patientUid);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDeptId, setBookingDeptId] = useState<string | null>(null);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);

  const [activeDoctorModal, setActiveDoctorModal] = useState<Doctor | null>(null);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Appointment | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    if (isDoctor) {
      setActiveTab('doctor-dashboard');
    } else {
      setActiveTab((currentTab) => currentTab === 'doctor-dashboard' ? 'home' : currentTab);
    }
  }, [isDoctor]);

  // Quick Action Handlers
  const handleOpenBooking = () => {
    setBookingDeptId(null);
    setBookingDoctorId(null);
    setIsBookingOpen(true);
  };

  const handleBookWithDoctor = (deptId: string, doctorId: string) => {
    setBookingDeptId(deptId);
    setBookingDoctorId(doctorId);
    setIsBookingOpen(true);
  };

  const handleDepartmentSelectFromHome = (deptId: string) => {
    setSelectedDeptIdForPage(deptId);
    setActiveTab('departments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDoctorProfileSelect = (doctor: Doctor) => {
    setActiveDoctorModal(doctor);
  };

  const handleAppointmentCreated = (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    setIsBookingOpen(false);
    setActiveTicket(newAppointment);
  };

  const handleCancelAppointment = (id: string) => {
    void (async () => {
      try {
        await updateAppointmentDetails(id, { status: 'Cancelled' });
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' as const } : apt))
        );
      } catch (error) {
        console.error('Could not cancel appointment:', error);
        window.alert('The appointment could not be cancelled. Please try again.');
      }
    })();
  };

  const handleRescheduleAppointment = (id: string, newDate: string, newSlot: string) => {
    void (async () => {
      try {
        await updateAppointmentDetails(id, { date: newDate, timeSlot: newSlot, status: 'Confirmed' });
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, date: newDate, timeSlot: newSlot, status: 'Confirmed' as const } : apt
          )
        );
      } catch (error) {
        console.error('Could not reschedule appointment:', error);
        window.alert('The appointment could not be rescheduled. Please try again.');
      }
    })();
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="border-b border-slate-800 bg-slate-950 text-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <span className="block text-sm font-bold">WeCare Admin</span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">Hospital operations</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-semibold text-white">{user?.displayName || 'Administrator'}</span>
                <span className="block text-[10px] text-slate-400">{user?.email}</span>
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>
        <main>
          <AdminDashboardPage onDoctorApproved={loadCustomDoctors} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 24/7 Level 1 Trauma Emergency Alert Banner */}
      {!isDoctor && <EmergencyBanner onOpenBooking={handleOpenBooking} />}

      {/* Top Navigation Bar with strict 3-zone contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'departments') {
            setSelectedDeptIdForPage(null);
          }
        }}
        onOpenBooking={handleOpenBooking}
        onOpenMyAppointments={() => setIsMyAppointmentsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        appointmentCount={visibleAppointments.filter((a) => a.status === 'Confirmed').length}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {isDoctor ? (
          <DoctorDashboardPage
            appointments={appointments}
            onUpdateAppointments={setAppointments}
            onNavigateToApplication={() => setActiveTab('doctor-apply')}
            onNavigateToStatus={() => setActiveTab('doctor-status')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        ) : (
          <>
        {activeTab === 'home' && (
          <HomePage
            onSelectTab={setActiveTab}
            onOpenBooking={handleOpenBooking}
            onSelectDepartment={handleDepartmentSelectFromHome}
            onSelectDoctor={handleDoctorProfileSelect}
            onQuickBook={handleBookWithDoctor}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage
            onSelectTab={setActiveTab}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentsPage
            selectedDeptId={selectedDeptIdForPage}
            allDoctors={allDoctors}
            onSelectDoctor={handleDoctorProfileSelect}
            onBookWithDoctor={handleBookWithDoctor}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsPage
            allDoctors={allDoctors}
            onSelectDoctor={handleDoctorProfileSelect}
            onBookWithDoctor={handleBookWithDoctor}
          />
        )}

        {activeTab === 'doctor-apply' && (
          <DoctorApplicationPage
            onNavigateToDashboard={() => setActiveTab('doctor-dashboard')}
            onNavigateToStatus={() => setActiveTab('doctor-status')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'doctor-status' && (
          <DoctorApplicationStatusPage
            onNavigateToApply={() => setActiveTab('doctor-apply')}
            onNavigateToDashboard={() => setActiveTab('doctor-dashboard')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'doctor-login' && (
          <DoctorLoginPage
            onLoginSuccess={() => setActiveTab('doctor-dashboard')}
            onNavigateToApply={() => setActiveTab('doctor-apply')}
            onNavigateToStatus={() => setActiveTab('doctor-status')}
          />
        )}

        {activeTab === 'doctor-dashboard' && (
          <DoctorDashboardPage
            appointments={appointments}
            onUpdateAppointments={setAppointments}
            onNavigateToApplication={() => setActiveTab('doctor-apply')}
            onNavigateToStatus={() => setActiveTab('doctor-status')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'admin-verify' && (
          <AdminDashboardPage
            onDoctorApproved={loadCustomDoctors}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
          </>
        )}
      </main>

      {/* Footer */}
      {!isDoctor && (
        <Footer
          onSelectTab={setActiveTab}
          onOpenBooking={handleOpenBooking}
          onSelectDepartment={handleDepartmentSelectFromHome}
        />
      )}

      {/* Doctor Detail Modal */}
      {!isDoctor && (
        <DoctorDetailModal
          doctor={activeDoctorModal}
          onClose={() => setActiveDoctorModal(null)}
          onBookDoctor={(doc) => handleBookWithDoctor(doc.departmentId, doc.id)}
        />
      )}

      {/* Appointment Booking Wizard Modal */}
      {!isDoctor && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          preselectedDepartmentId={bookingDeptId}
          preselectedDoctorId={bookingDoctorId}
          allDoctors={allDoctors}
          onAppointmentBooked={handleAppointmentCreated}
        />
      )}

      {/* Patient Visits Management Portal Modal */}
      {!isDoctor && (
        <MyAppointmentsModal
          isOpen={isMyAppointmentsOpen}
          onClose={() => setIsMyAppointmentsOpen(false)}
          appointments={visibleAppointments}
          onCancelAppointment={handleCancelAppointment}
          onRescheduleAppointment={handleRescheduleAppointment}
          onViewTicket={(apt) => setActiveTicket(apt)}
          onBookNew={handleOpenBooking}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Official Printable Appointment Ticket Modal */}
      {!isDoctor && activeTicket && (
        <AppointmentTicket
          appointment={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onNavigateToApply={() => setActiveTab('doctor-apply')}
        onNavigateToDashboard={() => setActiveTab('doctor-dashboard')}
      />

      <SupportTicketModal
        isOpen={isSupportOpen}
        user={user}
        onClose={() => setIsSupportOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Floating Emergency & Rapid Action Button */}
      <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2.5">
        <button
          type="button"
          onClick={() => setIsSupportOpen(true)}
          aria-label="Contact support"
          title="Contact support"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 shadow-lg transition hover:border-teal-300 hover:bg-teal-50 active:scale-95"
        >
          <LifeBuoy className="h-4 w-4 text-teal-700" />
          <span className="hidden sm:inline">Contact Support</span>
        </button>
        {!isDoctor && (
          <button
            onClick={handleOpenBooking}
            className="flex items-center gap-2 px-4 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer text-xs font-bold"
            title="Schedule Outpatient Consultation"
          >
            <span className="hidden sm:inline">Book Appointment</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
