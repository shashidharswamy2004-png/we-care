import React, { useState } from 'react';
import { Appointment } from '../types/hospital';
import { X, Calendar, Clock, User, CheckCircle2, AlertCircle, FileText, Ban, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MyAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment: (id: string, newDate: string, newSlot: string) => void;
  onViewTicket: (appointment: Appointment) => void;
  onBookNew: () => void;
  onOpenAuth?: () => void;
}

export const MyAppointmentsModal: React.FC<MyAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  onCancelAppointment,
  onRescheduleAppointment,
  onViewTicket,
  onBookNew,
  onOpenAuth
}) => {
  const { user } = useAuth();
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('11:00 AM');

  if (!isOpen) return null;

  const handleStartReschedule = (apt: Appointment) => {
    setReschedulingId(apt.id);
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setRescheduleDate(d.toISOString().split('T')[0]);
    setRescheduleSlot(apt.timeSlot);
  };

  const handleSaveReschedule = (id: string) => {
    if (!rescheduleDate) return;
    onRescheduleAppointment(id, rescheduleDate, rescheduleSlot);
    setReschedulingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white">
              +
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Patient Appointments Portal</h3>
              <p className="text-xs text-slate-400">View and manage your upcoming visits at WeCare Hospital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Patient Account Status Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-700" />
              {user ? (
                <span>
                  Logged in as <strong className="text-slate-800">{user.displayName || user.email}</strong>
                </span>
              ) : (
                <span className="text-slate-600">Viewing local patient records (Guest)</span>
              )}
            </div>
            {!user && onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                Sign In to Account
              </button>
            )}
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">No Scheduled Appointments</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You currently have no active appointments booked. Choose a doctor or department to schedule your consultation.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onBookNew();
                }}
                className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Scheduled Visits ({appointments.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onBookNew();
                  }}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  + Book Another Visit
                </button>
              </div>

              {appointments.map((apt) => {
                const isCancelled = apt.status === 'Cancelled';
                const isEditing = reschedulingId === apt.id;

                return (
                  <div
                    key={apt.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isCancelled
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-mono font-medium tabular-nums">
                            {apt.referenceNumber}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isCancelled ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-500">{apt.appointmentType}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{apt.doctorName}</h4>
                        <p className="text-xs text-teal-700">{apt.departmentName}</p>
                      </div>

                      <div className="text-left sm:text-right text-xs bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                        <div className="flex items-center sm:justify-end gap-1.5 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>
                            {new Date(apt.date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center sm:justify-end gap-1.5 text-slate-600 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    {/* Patient & Reason snippet */}
                    <div className="py-2.5 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400">Patient: </span>
                        <span className="font-medium text-slate-800">{apt.patientName}</span> ({apt.patientAge}y)
                      </div>
                      <div>
                        <span className="text-slate-400">Complaint: </span>
                        <span className="font-medium text-slate-800 truncate inline-block max-w-[200px] align-bottom">
                          {apt.reasonForVisit}
                        </span>
                      </div>
                    </div>

                    {/* Reschedule inline form */}
                    {isEditing && (
                      <div className="mt-3 p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
                        <span className="text-xs font-bold text-teal-900 block">Select New Date & Time Slot:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs"
                          />
                          <select
                            value={rescheduleSlot}
                            onChange={(e) => setRescheduleSlot(e.target.value)}
                            className="bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs"
                          >
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:30 AM">11:30 AM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="03:30 PM">03:30 PM</option>
                            <option value="05:00 PM">05:00 PM</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setReschedulingId(null)}
                            className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveReschedule(apt.id)}
                            className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg"
                          >
                            Confirm Reschedule
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => onViewTicket(apt)}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Official Slip</span>
                        </button>

                        {!isCancelled && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartReschedule(apt)}
                              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-slate-100"
                            >
                              <RotateCcw className="w-3 h-3 text-slate-500" />
                              <span>Reschedule</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this appointment?')) {
                                  onCancelAppointment(apt.id);
                                }
                              }}
                              className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-rose-50"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            For emergency changes or immediate clinical queries, call +1 (800) 932-CARE.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
