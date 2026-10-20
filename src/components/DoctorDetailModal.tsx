import React from 'react';
import { Doctor } from '../types/hospital';
import { X, Calendar, Clock, Star, Award, GraduationCap, Globe, CheckCircle2, DollarSign, MapPin, Navigation } from 'lucide-react';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onBookDoctor
}) => {
  if (!doctor) return null;
  const hasCoordinates = typeof doctor.latitude === 'number' && typeof doctor.longitude === 'number';
  const locationQuery = doctor.clinicAddress || doctor.locationName || doctor.hospitalOrClinic;
  const mapSrc = hasCoordinates
    ? `https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}&z=14&output=embed`
    : locationQuery
      ? `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&z=14&output=embed`
      : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-inner">
              {doctor.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-teal-200">
                <span>{doctor.departmentName}</span>
                <span>·</span>
                <span>{doctor.experienceYears} Years Practice</span>
              </div>
              <h3 className="text-2xl font-bold text-white mt-1">{doctor.name}</h3>
              <p className="text-sm text-teal-100 font-medium">{doctor.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-teal-100/90">
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span className="tabular-nums">{doctor.rating.toFixed(2)}</span>
                </span>
                <span>({doctor.reviewCount} verified patient reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Facts bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Consultation Fee</span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">${doctor.consultationFee}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Languages Spoken</span>
              <span className="font-semibold text-slate-800">{doctor.languages.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Clinic Availability</span>
              <span className="font-semibold text-teal-700">
                {doctor.isAvailableToday ? 'Available Today' : 'Next available slots'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs">
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>{doctor.locationName || 'WeCare Medical Campus'}</span>
            </div>
            <p className="text-xs text-slate-600">{doctor.clinicAddress || '742 Health Sciences Blvd, Metro City, Bengaluru'}</p>
            {mapSrc ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <iframe
                  title={`Doctor map ${doctor.name}`}
                  src={mapSrc}
                  className="w-full h-32 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">
                Map location has not been provided.
              </p>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery || doctor.name)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:underline"
            >
              <Navigation className="w-3 h-3" />
              Open location in maps
            </a>
          </div>

          {/* About & Clinical Philosophy */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Clinical Background & Bio
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.about}</p>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Areas of Clinical Focus
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {doctor.specializations.map((spec, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Qualifications & Education */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              <span>Education & Credentials</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="font-medium text-slate-800">{doctor.qualifications}</p>
              {doctor.education.map((edu, i) => (
                <p key={i} className="text-slate-500">· {edu}</p>
              ))}
            </div>
          </div>

          {/* Available Slots Preview */}
          <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-teal-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Consulting Days: {doctor.availableDays.join(', ')}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {doctor.availableSlots.map((slot, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-white text-teal-800 border border-teal-200 text-xs font-medium tabular-nums"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onBookDoctor(doctor);
            }}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book with {doctor.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
