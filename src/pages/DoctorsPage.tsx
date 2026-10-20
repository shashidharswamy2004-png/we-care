import React, { useMemo, useState } from 'react';
import { DOCTORS, DEPARTMENTS } from '../data/hospitalData';
import { Doctor } from '../types/hospital';
import {
  Search,
  Star,
  Calendar,
  Stethoscope,
  SlidersHorizontal,
  MapPin,
  Navigation,
} from 'lucide-react';

interface DoctorsPageProps {
  allDoctors?: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  onBookWithDoctor: (deptId: string, doctorId: string) => void;
}

const DEFAULT_CLINIC_COORDINATES = { latitude: 12.9716, longitude: 77.5946 };

function calculateDistanceKm(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDifference = toRadians(destination.latitude - origin.latitude);
  const longitudeDifference = toRadians(destination.longitude - origin.longitude);
  const arc = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(toRadians(origin.latitude))
    * Math.cos(toRadians(destination.latitude))
    * Math.sin(longitudeDifference / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  allDoctors = DOCTORS,
  onSelectDoctor,
  onBookWithDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [nearestOnly, setNearestOnly] = useState(false);
  const [patientCoordinates, setPatientCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'ready' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  const locationMap: Record<string, { locationName: string; city: string; clinicAddress: string; latitude: number; longitude: number }> = {
    'doc-1': { locationName: 'WeCare Heart Institute', city: 'Koramangala', clinicAddress: '12th Main Road, Koramangala, Bengaluru', latitude: 12.9352, longitude: 77.6245 },
    'doc-2': { locationName: 'WeCare Cardiac Centre', city: 'Indiranagar', clinicAddress: '18th Cross, Indiranagar, Bengaluru', latitude: 12.9719, longitude: 77.6412 },
    'doc-3': { locationName: 'WeCare Preventive Clinic', city: 'HSR Layout', clinicAddress: '14th Sector, HSR Layout, Bengaluru', latitude: 12.9121, longitude: 77.6513 },
    'doc-4': { locationName: 'NeuroCare Centre', city: 'Jayanagar', clinicAddress: '9th Block, Jayanagar, Bengaluru', latitude: 12.9259, longitude: 77.5935 },
    'doc-5': { locationName: 'Stroke & Neuro Institute', city: 'Whitefield', clinicAddress: 'ITPL Road, Whitefield, Bengaluru', latitude: 12.9698, longitude: 77.7499 },
    'doc-6': { locationName: 'Epilepsy & Sleep Clinic', city: 'Malleshwaram', clinicAddress: '7th Cross, Malleshwaram, Bengaluru', latitude: 13.0347, longitude: 77.5679 },
    'doc-7': { locationName: 'Orthocare Joint Centre', city: 'Domlur', clinicAddress: 'Old Airport Road, Domlur, Bengaluru', latitude: 12.9616, longitude: 77.6407 },
    'doc-8': { locationName: 'Sports Medicine Clinic', city: 'Banaswadi', clinicAddress: 'Outer Ring Road, Banaswadi, Bengaluru', latitude: 13.0200, longitude: 77.6500 },
    'doc-9': { locationName: 'Spine & Mobility Centre', city: 'Yelahanka', clinicAddress: 'Airport Road, Yelahanka, Bengaluru', latitude: 13.1007, longitude: 77.5964 },
    'doc-10': { locationName: 'BrightStart Pediatrics', city: 'Kalyan Nagar', clinicAddress: '3rd Block, Kalyan Nagar, Bengaluru', latitude: 13.0292, longitude: 77.6477 },
    'doc-11': { locationName: 'Child Airway Clinic', city: 'Sarjapur Road', clinicAddress: 'Sarjapur Road, Bengaluru', latitude: 12.9107, longitude: 77.6378 },
    'doc-12': { locationName: 'YoungCare Wellness Hub', city: 'Marathahalli', clinicAddress: 'Outer Ring Road, Marathahalli, Bengaluru', latitude: 12.9559, longitude: 77.7014 },
    'doc-13': { locationName: 'Cancer Precision Centre', city: 'Electronic City', clinicAddress: 'Hosur Road, Electronic City, Bengaluru', latitude: 12.8452, longitude: 77.6624 },
    'doc-14': { locationName: 'Breast & Tumor Clinic', city: 'Banashankari', clinicAddress: '2nd Stage, Banashankari, Bengaluru', latitude: 12.9358, longitude: 77.5231 },
    'doc-15': { locationName: 'Radiation Oncology Unit', city: 'Hebbal', clinicAddress: 'Airport Road Extension, Hebbal, Bengaluru', latitude: 13.0359, longitude: 77.5986 },
    'doc-16': { locationName: 'Mother & Baby Centre', city: 'Basavanagudi', clinicAddress: 'K.R. Road, Basavanagudi, Bengaluru', latitude: 12.9408, longitude: 77.5737 },
    'doc-17': { locationName: 'Women’s Surgery Suite', city: 'MG Road', clinicAddress: 'MG Road, Bengaluru', latitude: 12.9754, longitude: 77.6056 },
    'doc-18': { locationName: 'Women’s Health & Fertility Clinic', city: 'JP Nagar', clinicAddress: '7th Phase, JP Nagar, Bengaluru', latitude: 12.8917, longitude: 77.5845 },
    'doc-19': { locationName: 'Emergency & Trauma Care Hub', city: 'Brookefield', clinicAddress: 'Brookefield Road, Bengaluru', latitude: 12.9652, longitude: 77.7144 },
    'doc-20': { locationName: 'Critical Care Unit', city: 'Bellandur', clinicAddress: 'Bellandur Road, Bengaluru', latitude: 12.9305, longitude: 77.6779 },
    'doc-21': { locationName: 'Skin & Laser Clinic', city: 'Richmond Town', clinicAddress: 'Residency Road, Richmond Town, Bengaluru', latitude: 12.9622, longitude: 77.6068 },
    'doc-22': { locationName: 'Dermatology & Aesthetics Clinic', city: 'Vijayanagar', clinicAddress: 'Mysore Road, Vijayanagar, Bengaluru', latitude: 12.97, longitude: 77.5309 }
  };

  const handleNearbyToggle = () => {
    if (nearestOnly) {
      setNearestOnly(false);
      return;
    }

    if (patientCoordinates) {
      setNearestOnly(true);
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Location access is not supported by this browser.');
      return;
    }

    setLocationStatus('locating');
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPatientCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus('ready');
        setNearestOnly(true);
      },
      (error) => {
        setLocationStatus('error');
        setLocationError(error.code === error.PERMISSION_DENIED
          ? 'Location access was denied. Enable it in your browser settings to find nearby doctors.'
          : 'Could not get your location. Please try again.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const withLocation = useMemo(() => allDoctors.map((doc) => {
    const details = locationMap[doc.id] || {
      locationName: doc.locationName || doc.hospitalOrClinic || 'Location not provided',
      city: doc.city || '',
      clinicAddress: doc.clinicAddress || doc.city || doc.hospitalOrClinic || '',
      latitude: doc.latitude,
      longitude: doc.longitude
    };

    const hasClinicCoordinates = typeof details.latitude === 'number'
      && typeof details.longitude === 'number';
    const distanceKm = patientCoordinates && hasClinicCoordinates
      ? calculateDistanceKm(patientCoordinates, details)
      : null;

    return {
      ...doc,
      ...details,
      distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(1))
    } as Doctor & { distanceKm: number | null };
  }), [allDoctors, patientCoordinates]);

  const filteredDoctors = withLocation.filter((doc) => {
    if (selectedDeptFilter !== 'all' && doc.departmentId !== selectedDeptFilter) {
      return false;
    }
    if (onlyAvailableToday && !doc.isAvailableToday) {
      return false;
    }
    if (nearestOnly && (doc.distanceKm === null || doc.distanceKm > 8)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchDept = doc.departmentName.toLowerCase().includes(q);
      const matchSpecs = doc.specializations.some((s) => s.toLowerCase().includes(q));
      const matchLang = doc.languages.some((l) => l.toLowerCase().includes(q));
      const matchLocation = (doc.locationName || '').toLowerCase().includes(q) || (doc.city || '').toLowerCase().includes(q);
      return matchName || matchTitle || matchDept || matchSpecs || matchLang || matchLocation;
    }
    return true;
  }).sort((a, b) => nearestOnly
    ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    : 0);

  const availableTodayCount = withLocation.filter((doctor) => doctor.isAvailableToday).length;
  const nearbyDoctorCount = patientCoordinates
    ? withLocation.filter((doctor) => doctor.distanceKm !== null && doctor.distanceKm <= 8).length
    : null;
  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedDeptFilter !== 'all' || onlyAvailableToday || nearestOnly
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
          Faculty & Attending Staff
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Find a Specialist Physician
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Search over 20 board-certified senior consultants, surgeons, and specialists across our departments. Book in-person visits or telehealth appointments.
        </p>
      </div>

      {/* Doctor Finder */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-teal-700 via-cyan-500 to-emerald-400" />
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-teal-50/80 via-white to-cyan-50/60 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-white text-teal-700 shadow-xs">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Find the right specialist</h2>
            <p className="mt-0.5 text-xs text-slate-500">Search the roster or narrow by care and location.</p>
          </div>
          <div className="sm:ml-auto sm:text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800">
              <Stethoscope className="h-3.5 w-3.5" />
              {filteredDoctors.length} of {allDoctors.length} doctors
            </span>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(230px,0.55fr)]">
            <label className="relative block">
              <span className="sr-only">Search doctors</span>
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />
              <input
                type="search"
                placeholder="Doctor, specialty, language, or clinic"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
              >
                <option value="all">All departments ({allDoctors.length})</option>
                {DEPARTMENTS.map((dept) => {
                  const count = allDoctors.filter((doctor) => doctor.departmentId === dept.id).length;
                  return (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({count})
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              role="switch"
              aria-checked={onlyAvailableToday}
              onClick={() => setOnlyAvailableToday((value) => !value)}
              className={`flex min-h-16 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                onlyAvailableToday
                  ? 'border-teal-300 bg-teal-50 ring-2 ring-teal-100'
                  : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${onlyAvailableToday ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Calendar className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800">Available today</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">{availableTodayCount} doctors taking appointments</span>
              </span>
              <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${onlyAvailableToday ? 'bg-teal-700' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${onlyAvailableToday ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={nearestOnly}
              aria-busy={locationStatus === 'locating'}
              onClick={handleNearbyToggle}
              disabled={locationStatus === 'locating'}
              className={`flex min-h-16 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition disabled:cursor-wait disabled:opacity-70 ${
                nearestOnly
                  ? 'border-cyan-300 bg-cyan-50 ring-2 ring-cyan-100'
                  : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${nearestOnly ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <MapPin className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800">Near me</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  {locationStatus === 'locating'
                    ? 'Getting your location...'
                    : locationStatus === 'ready'
                      ? `${nearbyDoctorCount ?? 0} doctors within 8 km`
                      : 'Use your location to find nearby doctors'}
                </span>
              </span>
              <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${nearestOnly ? 'bg-cyan-700' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${nearestOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
            </button>
          </div>

          {locationError && (
            <p role="status" className="text-xs text-rose-700">{locationError}</p>
          )}
          {locationStatus === 'ready' && (
            <p role="status" className="text-[11px] text-slate-500">
              Distances are calculated in your browser; your location is not sent to the server.
            </p>
          )}

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Browse by specialty</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDeptFilter('all');
                    setOnlyAvailableToday(false);
                    setNearestOnly(false);
                  }}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedDeptFilter('all')}
                aria-pressed={selectedDeptFilter === 'all'}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  selectedDeptFilter === 'all'
                    ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                All specialties <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${selectedDeptFilter === 'all' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{allDoctors.length}</span>
              </button>
              {DEPARTMENTS.map((department) => {
                const isSelected = selectedDeptFilter === department.id;
                const count = allDoctors.filter((doctor) => doctor.departmentId === department.id).length;
                return (
                  <button
                    key={department.id}
                    type="button"
                    onClick={() => setSelectedDeptFilter(department.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                    }`}
                  >
                    {department.name.split(' ')[0]}
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${isSelected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong>{filteredDoctors.length}</strong> matching physicians
        </span>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptFilter('all');
              setOnlyAvailableToday(false);
              setNearestOnly(false);
            }}
            className="text-teal-700 hover:underline cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No physicians match your filter criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your search term or select "All Specialties" to explore our full clinical roster.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptFilter('all');
              setOnlyAvailableToday(false);
              setNearestOnly(false);
            }}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                {/* Doctor Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {doc.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-teal-700 font-semibold mt-0.5">{doc.departmentName}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{doc.title}</p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="tabular-nums text-slate-800">{doc.rating.toFixed(2)}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 text-[11px]">{doc.experienceYears} Years Exp.</span>
                    </div>
                  </div>
                </div>

                {/* About & Specialties */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {doc.about}
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-teal-700" />
                      {doc.locationName}
                    </span>
                    <span className="font-semibold text-teal-700 tabular-nums">
                      {doc.distanceKm === null ? 'Use location' : `${doc.distanceKm} km`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{doc.clinicAddress}</p>
                  {typeof doc.latitude === 'number' && typeof doc.longitude === 'number' ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <iframe
                        title={`Map for ${doc.name}`}
                        src={`https://www.google.com/maps?q=${doc.latitude},${doc.longitude}&z=14&output=embed`}
                        className="w-full h-20 border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-[10px] text-slate-500">
                      Clinic coordinates not available
                    </div>
                  )}
                  {(doc.clinicAddress || doc.city) && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.clinicAddress || doc.city || '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      Open in Maps
                    </a>
                  )}
                </div>

                {/* Focus areas */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Specializations:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {doc.specializations.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule & Fee meta */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <span className="font-bold text-slate-900 tabular-nums">${doc.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Clinic Days:</span>
                    <span className="font-medium text-slate-700">{doc.availableDays.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => onBookWithDoctor(doc.departmentId, doc.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
