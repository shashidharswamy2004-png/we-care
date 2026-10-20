import React from 'react';
import { Appointment } from '../types/hospital';
import { Calendar, Clock, MapPin, Printer, Download, CheckCircle, User, Phone, Mail, AlertTriangle, X } from 'lucide-react';

interface AppointmentTicketProps {
  appointment: Appointment;
  onClose: () => void;
}

export const AppointmentTicket: React.FC<AppointmentTicketProps> = ({ appointment, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = () => {
    // Generate .ics calendar file
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WeCare Hospital//Appointment Booking//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Medical Appointment with ${appointment.doctorName}`,
      `DESCRIPTION:Appointment at WeCare Hospital\\nDepartment: ${appointment.departmentName}\\nType: ${appointment.appointmentType}\\nReference: ${appointment.referenceNumber}\\nPatient: ${appointment.patientName}`,
      `LOCATION:WeCare Hospital, 742 Health Sciences Blvd, Metro City`,
      `DTSTART:${appointment.date.replace(/-/g, '')}T090000Z`,
      `DTEND:${appointment.date.replace(/-/g, '')}T100000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `wecare-appointment-${appointment.referenceNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header / Brand strip */}
        <div className="bg-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-teal-800 font-bold flex items-center justify-center text-lg">
              +
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">WeCare Hospital</h3>
              <p className="text-xs text-teal-100">Official Appointment Confirmation Pass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close pass"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Body - id="printable-appointment-ticket" for print media query */}
        <div id="printable-appointment-ticket" className="p-6 space-y-6">
          {/* Status banner */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-900">Appointment Confirmed</p>
                <p className="text-[11px] text-emerald-700">A slot has been reserved with the physician.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Reference No.</span>
              <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                {appointment.referenceNumber}
              </span>
            </div>
          </div>

          {/* Doctor & Schedule Grid */}
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
            <div className="p-4 bg-slate-50/60">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Consulting Physician
              </span>
              <h4 className="text-base font-bold text-slate-900">{appointment.doctorName}</h4>
              <p className="text-xs text-teal-700 font-medium">{appointment.doctorTitle}</p>
              <p className="text-xs text-slate-500 mt-0.5">{appointment.departmentName}</p>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Date</span>
                </span>
                <p className="font-semibold text-sm text-slate-900">
                  {new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Time Slot</span>
                </span>
                <p className="font-semibold text-sm text-slate-900">{appointment.timeSlot}</p>
              </div>
            </div>

            <div className="p-4 bg-white">
              <span className="text-xs text-slate-500 block mb-1">Consultation Mode</span>
              <p className="text-sm font-semibold text-slate-800">{appointment.appointmentType}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Patient Information
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Name:</span>
                <span className="font-medium text-slate-900">{appointment.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age / Gender:</span>
                <span className="font-medium text-slate-900">
                  {appointment.patientAge} yrs · {appointment.patientGender}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="font-medium text-slate-900">{appointment.patientPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email:</span>
                <span className="font-medium text-slate-900 truncate block">{appointment.patientEmail}</span>
              </div>
            </div>
            {appointment.reasonForVisit && (
              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 block">Primary Reason:</span>
                <p className="text-slate-800 font-medium italic mt-0.5">{appointment.reasonForVisit}</p>
              </div>
            )}
          </div>

          {/* Location & Instructions */}
          <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hospital Location:</strong> WeCare Hospital, Main Clinical Tower, 742 Health Sciences Blvd, Metro City.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-500">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Please check in at the reception 15 minutes before your time slot. Carry a government photo ID and relevant prior diagnostic files.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={handleDownloadCalendar}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
