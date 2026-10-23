import React, { useState, useEffect } from 'react';
import { Department, Doctor, Appointment, AppointmentType } from '../types/hospital';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { X, Calendar, Clock, Check, User, Phone, Mail, Stethoscope, Video, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveAppointment } from '../services/doctorService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string | null;
  preselectedDepartmentId?: string | null;
  allDoctors?: Doctor[];
  onAppointmentBooked: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctorId,
  preselectedDepartmentId,
  allDoctors = DOCTORS,
  onAppointmentBooked
}) => {
  const { user } = useAuth();
  // Form State
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    preselectedDepartmentId || DEPARTMENTS[0].id
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    preselectedDoctorId || ''
  );
  const [appointmentType, setAppointmentType] = useState<AppointmentType>(
    'In-Person Consultation'
  );

  // Generate 14 selectable future dates
  const nextDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ iso, dayName, monthDay, dateObj: d });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(nextDates[0].iso);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');

  // Patient inputs
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Female' | 'Male' | 'Other' | 'Prefer not to say'>('Female');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync props when opening
  useEffect(() => {
    if (preselectedDepartmentId) {
      setSelectedDeptId(preselectedDepartmentId);
    }
    if (preselectedDoctorId) {
      setSelectedDoctorId(preselectedDoctorId);
      const doc = DOCTORS.find((d) => d.id === preselectedDoctorId);
      if (doc) {
        setSelectedDeptId(doc.departmentId);
      }
    } else {
      // Pick first doctor of currently selected department if none
      const deptDocs = allDoctors.filter((d) => d.departmentId === (preselectedDepartmentId || DEPARTMENTS[0].id));
      if (deptDocs.length > 0) {
        setSelectedDoctorId(deptDocs[0].id);
      }
    }

    if (isOpen && user) {
      if (user.displayName && !patientName) {
        setPatientName(user.displayName);
      }
      if (user.email && !patientEmail) {
        setPatientEmail(user.email);
      }
    }
  }, [preselectedDepartmentId, preselectedDoctorId, isOpen, user, allDoctors]);

  // When department changes, update doctor if current doctor is not in that department
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const deptDoctors = allDoctors.filter((d) => d.departmentId === deptId);
    if (deptDoctors.length > 0) {
      setSelectedDoctorId(deptDoctors[0].id);
    }
  };

  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  const doctorsInDept = allDoctors.filter((d) => d.departmentId === selectedDeptId);
  const currentDoctor = allDoctors.find((d) => d.id === selectedDoctorId) || doctorsInDept[0];

  const timeSlots = currentDoctor?.availableSlots?.length
    ? currentDoctor.availableSlots
    : ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  if (!isOpen) return null;

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!patientName.trim()) errors.patientName = 'Full name is required';
    if (!patientEmail.trim() || !patientEmail.includes('@')) errors.patientEmail = 'Valid email is required';
    if (!patientPhone.trim() || patientPhone.length < 7) errors.patientPhone = 'Valid phone number is required';
    if (!patientAge || parseInt(patientAge) < 0 || parseInt(patientAge) > 125) errors.patientAge = 'Valid age is required';
    if (!reasonForVisit.trim()) errors.reasonForVisit = 'Please describe the symptom or reason for visit';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        referenceNumber: `WC-2026-${randomSuffix}`,
        departmentId: currentDept.id,
        departmentName: currentDept.name,
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorTitle: currentDoctor.title,
        appointmentType,
        date: selectedDate,
        timeSlot: selectedSlot,
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: patientAge.trim(),
        patientGender,
        reasonForVisit: reasonForVisit.trim(),
        isFirstVisit,
        notes: notes.trim(),
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        patientUid: user?.uid,
        doctorUid: currentDoctor?.userId
      };

      await saveAppointment(newAppointment);
      onAppointmentBooked(newAppointment);
    } catch (error) {
      console.error('Could not save appointment:', error);
      setSubmitError('The appointment could not be booked. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-teal-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-700 border border-teal-600 flex items-center justify-center font-bold text-white">
              +
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Schedule an Appointment</h3>
              <p className="text-xs text-teal-200">WeCare Hospital Outpatient & Telehealth Booking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Department & Doctor */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">1</span>
              <span>Select Department & Physician</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinical Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">{currentDept.floor}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Consulting Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                >
                  {doctorsInDept.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.title}
                    </option>
                  ))}
                </select>
                {currentDoctor && (
                  <p className="text-[11px] text-teal-700 mt-1 font-medium">
                    Consultation Fee: ${currentDoctor.consultationFee} · {currentDoctor.experienceYears} yrs exp.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Appointment Mode */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">2</span>
              <span>Consultation Mode</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { type: 'In-Person Consultation' as AppointmentType, icon: Stethoscope, desc: 'Visit hospital clinic suite' },
                { type: 'Video / Telehealth' as AppointmentType, icon: Video, desc: 'HD Video link via browser' },
                { type: 'Executive Health Checkup' as AppointmentType, icon: FileText, desc: 'Full diagnostic panel' }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = appointmentType === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setAppointmentType(item.type)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-teal-700' : 'text-slate-500'}`} />
                    <p className="text-xs font-bold">{item.type}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Date & Time Slot */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">3</span>
              <span>Select Date & Preferred Slot</span>
            </h4>

            {/* Date scroll strip */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Available Appointment Dates
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {nextDates.map((item) => {
                  const isSelected = selectedDate === item.iso;
                  return (
                    <button
                      type="button"
                      key={item.iso}
                      onClick={() => setSelectedDate(item.iso)}
                      className={`px-3 py-2.5 rounded-xl border text-center shrink-0 min-w-[76px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold uppercase">{item.dayName}</span>
                      <span className="block text-xs font-bold mt-0.5">{item.monthDay}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Available Consultation Slots</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer tabular-nums ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 4: Patient Details */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">4</span>
              <span>Patient Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Davis"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.patientName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-teal-600'
                  }`}
                />
                {formErrors.patientName && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.patientName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.patientPhone ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-teal-600'
                  }`}
                />
                {formErrors.patientPhone && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.patientPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.patientEmail ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-teal-600'
                  }`}
                />
                {formErrors.patientEmail && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.patientEmail}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    placeholder="35"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.patientAge ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-teal-600'
                    }`}
                  />
                  {formErrors.patientAge && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.patientAge}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason for Visit / Primary Symptoms *
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe your symptoms, concern, or medical question..."
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.reasonForVisit ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-teal-600'
                }`}
              />
              {formErrors.reasonForVisit && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.reasonForVisit}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isFirstVisit}
                  onChange={(e) => setIsFirstVisit(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>This is my first visit to WeCare Hospital</span>
              </label>
            </div>
          </div>

          {/* Pricing & Summary card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="text-slate-500">Summary:</p>
              <p className="font-semibold text-slate-900">
                {currentDoctor?.name} · {appointmentType}
              </p>
              <p className="text-slate-600">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}{' '}
                at {selectedSlot}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Total Due at Consultation</span>
              <span className="text-lg font-bold text-teal-800 tabular-nums">
                ${currentDoctor?.consultationFee || 150}
              </span>
              <span className="text-[10px] text-slate-400 block">Zero upfront booking deposit</span>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {submitError && <p role="alert" className="mr-auto text-xs text-rose-600">{submitError}</p>}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:cursor-wait disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Booking...' : 'Confirm & Book Appointment'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
