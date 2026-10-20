import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../data/hospitalData';
import { DoctorApplication, ConsultationMode } from '../types/hospital';
import { submitDoctorApplication, getDoctorApplication } from '../services/doctorService';
import {
  ShieldCheck,
  Stethoscope,
  Award,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Languages,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  FileText,
  AlertTriangle,
  Info,
  Sparkles,
  Plus,
  Trash2,
  MapPin,
  Navigation
} from 'lucide-react';

interface DoctorApplicationPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToStatus: () => void;
  onOpenAuth: () => void;
}

export const DoctorApplicationPage: React.FC<DoctorApplicationPageProps> = ({
  onNavigateToDashboard,
  onNavigateToStatus,
  onOpenAuth
}) => {
  const { user } = useAuth();

  // Multi-step form step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Licensure & Education
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('');
  const [registrationAuthority, setRegistrationAuthority] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [university, setUniversity] = useState('');
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear() - 8);

  // Specialization & Experience
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);
  const [specialization, setSpecialization] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(8);
  const [hospitalOrClinic, setHospitalOrClinic] = useState('WeCare Hospital Affiliated Practice');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [clinicCoordinates, setClinicCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Bio & Languages
  const [biography, setBiography] = useState('');
  const [languagesInput, setLanguagesInput] = useState('English, Spanish');

  // Consultation Details
  const [consultationFee, setConsultationFee] = useState(150);
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('Both (In-Person & Video)');
  const [availableDays, setAvailableDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [availableHours, setAvailableHours] = useState('09:00 AM - 05:00 PM');

  // Declared document registry; file uploads are not currently supported.
  const [declaredDocs, setDeclaredDocs] = useState<string[]>([
    'State Medical Board License Copy',
    'Postgraduate Degree Certificate'
  ]);
  const [newDocName, setNewDocName] = useState('');

  // Form Submission States
  const [existingApp, setExistingApp] = useState<DoctorApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Check if current user already submitted an application
  useEffect(() => {
    async function checkExisting() {
      if (user) {
        setEmail(user.email || '');
        if (!fullName && user.displayName) {
          setFullName(user.displayName);
        }
        const app = await getDoctorApplication(user.uid);
        if (app) {
          setExistingApp(app);
        }
      }
    }
    checkExisting();
  }, [user]);

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddDeclaredDoc = () => {
    if (!newDocName.trim()) return;
    setDeclaredDocs(prev => [...prev, newDocName.trim()]);
    setNewDocName('');
  };

  const handleRemoveDeclaredDoc = (index: number) => {
    setDeclaredDocs(prev => prev.filter((_, i) => i !== index));
  };

  // Step Validation logic
  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    if (currentStep === 1) {
      if (!fullName.trim()) errors.push('Full name is required.');
      if (!email.trim() || !email.includes('@')) errors.push('A valid email address is required.');
      if (!phone.trim()) errors.push('Contact phone number is required.');
    } else if (currentStep === 2) {
      if (!medicalRegistrationNumber.trim()) errors.push('Medical Registration Number is required.');
      if (!registrationAuthority.trim()) errors.push('Registration Authority / Medical Council is required.');
      if (!qualifications.trim()) errors.push('Medical qualifications (e.g. MBBS, MD) are required.');
      if (!university.trim()) errors.push('Graduating university / medical school is required.');
      if (!graduationYear || graduationYear < 1960 || graduationYear > new Date().getFullYear()) {
        errors.push('Please enter a valid graduation year.');
      }
    } else if (currentStep === 3) {
      if (!specialization.trim()) errors.push('Clinical specialization is required.');
      if (yearsOfExperience < 0) errors.push('Years of experience must be 0 or greater.');
      if (!hospitalOrClinic.trim()) errors.push('Primary hospital or clinic affiliation is required.');
      if (!clinicAddress.trim()) errors.push('Hospital or clinic street address is required.');
      if (!biography.trim() || biography.trim().length < 20) {
        errors.push('Professional biography must be at least 20 characters long.');
      }
      if (availableDays.length === 0) errors.push('Select at least one available consulting day.');
      if (consultationFee < 10) errors.push('Consultation fee must be at least $10.');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setValidationErrors([]);
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Location access is not supported by this browser. Enter the clinic address manually.');
      return;
    }

    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setClinicCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus('idle');
      },
      (error) => {
        setLocationStatus('error');
        setLocationError(error.code === error.PERMISSION_DENIED
          ? 'Location access was denied. Allow it in your browser settings or enter the clinic address manually.'
          : 'Could not get your location. Please try again or enter the clinic address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('You must be signed in with a WeCare account to submit a doctor application.');
      onOpenAuth();
      return;
    }

    if (!validateCurrentStep()) return;

    setSubmitting(true);
    try {
      const selectedDept = DEPARTMENTS.find(d => d.id === departmentId) || DEPARTMENTS[0];
      const parsedLanguages = languagesInput
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);

      const payload = {
        id: user.uid, // Unique application ID tied to authenticated UID
        userId: user.uid,
        email: email.trim() || user.email || '',
        fullName: fullName.trim(),
        phone: phone.trim(),
        medicalRegistrationNumber: medicalRegistrationNumber.trim(),
        registrationAuthority: registrationAuthority.trim(),
        qualifications: qualifications.trim(),
        university: university.trim(),
        graduationYear: Number(graduationYear),
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        specialization: specialization.trim(),
        yearsOfExperience: Number(yearsOfExperience),
        hospitalOrClinic: hospitalOrClinic.trim(),
        clinicAddress: clinicAddress.trim(),
        clinicCity: clinicCity.trim(),
        latitude: clinicCoordinates?.latitude,
        longitude: clinicCoordinates?.longitude,
        biography: biography.trim(),
        languagesSpoken: parsedLanguages.length > 0 ? parsedLanguages : ['English'],
        consultationFee: Number(consultationFee),
        consultationMode,
        availableDays,
        availableHours: availableHours.trim() || '09:00 AM - 05:00 PM',
        declaredDocumentNames: declaredDocs
      };

      const result = await submitDoctorApplication(payload);
      setExistingApp(result);
      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit application. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // If application was just submitted or already exists, display current status link
  if (submittedSuccess || existingApp) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Doctor Registration Submitted
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Application Received & Queued for Review
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Thank you, <strong>{existingApp?.fullName || fullName}</strong>. Your credential registration has been recorded with status <span className="font-semibold text-amber-700 uppercase">Pending</span>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-2.5 max-w-lg mx-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Applicant ID (UID):</span>
              <span className="font-mono text-slate-800">{user?.uid.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Registration Number:</span>
              <span className="font-semibold text-slate-800">{existingApp?.medicalRegistrationNumber || medicalRegistrationNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Current Verification Status:</span>
              <span className="px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800 text-[10px]">
                {existingApp?.status || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Physical Certificate Status:</span>
              <span className="text-slate-600 italic">Unverified (Pending Board Review)</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 text-left flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold">Certificate Upload Notice:</strong>
              <p className="text-amber-800 leading-relaxed">
                Certificate file uploads are not currently supported. Declared document titles remain <em>unverified</em> until physical verification is completed by the hospital credentialing board.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onNavigateToStatus}
              className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Track My Application Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {existingApp?.status === 'approved' && (
              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Access Doctor Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Stage 1: Physician Credential Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Join WeCare Hospital as an Attending Physician
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Submit your official medical registration details, clinical qualifications, and consultation practice schedule. Applications are recorded for administrative credential verification.
        </p>
      </div>

      {/* Auth Guard Banner */}
      {!user && (
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-700 shrink-0" />
            <span>You must be signed in with a user account to bind your applicant UID to this registration.</span>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shrink-0 cursor-pointer"
          >
            Sign In or Create Account
          </button>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { step: 1, label: 'Identity' },
            { step: 2, label: 'Licensure' },
            { step: 3, label: 'Practice' },
            { step: 4, label: 'Documents' },
            { step: 5, label: 'Review' }
          ].map(s => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                className={`py-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-teal-50 border border-teal-200 text-teal-900 font-bold'
                    : isDone
                    ? 'text-teal-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <div className="text-[11px] font-mono">Step {s.step}</div>
                <div className="text-xs truncate hidden sm:block">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error / Validation Feedback */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please complete the required fields:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-6">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmitApplication} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* STEP 1: Full Name, Email, Phone */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <span>1. Personal & Contact Identity</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide your legal name and direct physician contact information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name (including Dr. title) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arthur Vance"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physician Email Address *
                </label>
                <input
                  type="email"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Direct Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Medical Registration, Qualifications, University, Graduation Year */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-700" />
                <span>2. Medical Registration & University Education</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Accurate license registration numbers will be matched against medical registry databases.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Medical Registration / License Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MED-LIC-849201"
                  value={medicalRegistrationNumber}
                  onChange={e => setMedicalRegistrationNumber(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registration Authority / Medical Council *
                </label>
                <input
                  type="text"
                  placeholder="e.g. General Medical Council / State Board"
                  value={registrationAuthority}
                  onChange={e => setRegistrationAuthority(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Medical Qualifications (Degrees) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD, FRCP"
                  value={qualifications}
                  onChange={e => setQualifications(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Graduating University / Medical College *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Johns Hopkins School of Medicine"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Year of Graduation *
                </label>
                <input
                  type="number"
                  min="1960"
                  max={new Date().getFullYear()}
                  value={graduationYear}
                  onChange={e => setGraduationYear(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Specialization, Experience, Hospital, Bio, Languages, Fees & Mode */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-700" />
                <span>3. Clinical Practice, Availability & Fees</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify your hospital department, consultation mode, practice days, and patient fee.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hospital Department *
                </label>
                <select
                  value={departmentId}
                  onChange={e => setDepartmentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Specialization *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Interventional Cardiology & Angioplasty"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Years of Medical Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={yearsOfExperience}
                  onChange={e => setYearsOfExperience(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Hospital or Clinic *
                </label>
                <input
                  type="text"
                  placeholder="e.g. WeCare Hospital Pavilion / Private Clinic"
                  value={hospitalOrClinic}
                  onChange={e => setHospitalOrClinic(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div>
                  <label htmlFor="clinic-address" className="block font-semibold text-slate-700 mb-1">
                    Hospital or Clinic Address *
                  </label>
                  <input
                    id="clinic-address"
                    type="text"
                    placeholder="Street address, building, area"
                    value={clinicAddress}
                    onChange={(event) => {
                      setClinicAddress(event.target.value);
                      setClinicCoordinates(null);
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label htmlFor="clinic-city" className="block font-semibold text-slate-700 mb-1">
                    City / State
                  </label>
                  <input
                    id="clinic-city"
                    type="text"
                    placeholder="e.g. Bengaluru, Karnataka"
                    value={clinicCity}
                    onChange={(event) => setClinicCity(event.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Enter the clinic address, or add a map pin using your current location.
                  </p>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locationStatus === 'locating'}
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-700 bg-white px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {locationStatus === 'locating' ? <MapPin className="h-4 w-4 animate-pulse" /> : <Navigation className="h-4 w-4" />}
                    {locationStatus === 'locating' ? 'Getting location...' : 'Use current location'}
                  </button>
                </div>
                {clinicCoordinates && (
                  <p className="text-xs font-medium text-emerald-700">
                    Map pin added: {clinicCoordinates.latitude.toFixed(5)}, {clinicCoordinates.longitude.toFixed(5)}
                  </p>
                )}
                {locationError && <p role="alert" className="text-xs text-rose-700">{locationError}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultation Mode *
                </label>
                <select
                  value={consultationMode}
                  onChange={e => setConsultationMode(e.target.value as ConsultationMode)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                >
                  <option value="Both (In-Person & Video)">Both (In-Person & Video)</option>
                  <option value="In-Person">In-Person Only</option>
                  <option value="Video / Telehealth">Video / Telehealth Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultation Fee ($ USD) *
                </label>
                <input
                  type="number"
                  min="10"
                  max="1500"
                  value={consultationFee}
                  onChange={e => setConsultationFee(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, Spanish, French"
                  value={languagesInput}
                  onChange={e => setLanguagesInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Available Consultation Days *
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => {
                    const isSelected = availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Consulting Hours
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                  value={availableHours}
                  onChange={e => setAvailableHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Professional Biography & Clinical Philosophy *
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail your clinical journey, research focus, fellowship training, and patient care approach..."
                  value={biography}
                  onChange={e => setBiography(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Declared Credentials Registry (NO FILE UPLOADS) */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <span>4. Declared Credentials & Document Registry</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record the document names of your medical certificates.
              </p>
            </div>

            {/* Spark Free Plan Prominent Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Certificate uploads will be available after secure storage is configured.</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Certificate file uploads are not currently supported. You may record credential titles below; they will be saved as <strong>unverified</strong> until physically authenticated by hospital administration.
              </p>
            </div>

            {/* Document Name Entry */}
            <div className="space-y-3 pt-2">
              <label className="block font-semibold text-slate-700 text-xs">
                Declare Supporting Credential Titles (e.g. State Board License, Board Fellowship):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. National Board Medical Registration Certificate"
                  value={newDocName}
                  onChange={e => setNewDocName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddDeclaredDoc}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Document Title</span>
                </button>
              </div>

              {/* Declared List */}
              <div className="space-y-2 pt-2">
                {declaredDocs.map((docTitle, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 truncate">{docTitle}</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold uppercase">
                          Unverified Title Declaration
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeclaredDoc(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove document entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <span>5. Review Credential Details & Affirmation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm your submission. Once submitted, your registration will be recorded as 'pending'.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Full Name:</span>
                  <strong className="text-slate-900">{fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Email & Phone:</span>
                  <span className="text-slate-800">{email} · {phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registration Number & Authority:</span>
                  <span className="font-mono font-bold text-teal-800">{medicalRegistrationNumber}</span>
                  <span className="text-slate-600 block text-[11px]">{registrationAuthority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Qualifications & University:</span>
                  <span className="text-slate-800 font-medium">{qualifications}</span>
                  <span className="text-slate-600 block text-[11px]">{university} (Class of {graduationYear})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Specialization & Department:</span>
                  <span className="text-slate-900 font-medium">{specialization}</span>
                  <span className="text-teal-700 text-[11px] block">{departmentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Experience & Current Facility:</span>
                  <span className="text-slate-800">{yearsOfExperience} Years · {hospitalOrClinic}</span>
                  <span className="mt-1 block text-slate-600">{[clinicAddress, clinicCity].filter(Boolean).join(', ') || 'Clinic address not entered'}</span>
                  {clinicCoordinates && (
                    <span className="mt-1 block text-[11px] text-teal-700">
                      Map pin: {clinicCoordinates.latitude.toFixed(5)}, {clinicCoordinates.longitude.toFixed(5)}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">Consultation Fee & Mode:</span>
                  <span className="text-slate-800 font-bold">${consultationFee} / session · {consultationMode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Schedule:</span>
                  <span className="text-slate-800">{availableDays.join(', ')} ({availableHours})</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Declared Documents for In-Person Verification:</span>
                <div className="flex flex-wrap gap-1.5">
                  {declaredDocs.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[11px]">
                      {d} (Unverified)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
              <p>
                <strong>Affirmation:</strong> By submitting, you affirm that the credentials provided are accurate and authorize WeCare Hospital to verify registration records with the governing medical licensing authorities.
              </p>
            </div>
          </div>
        )}

        {/* Multi-step Navigation Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={submitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || !user}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? 'Submitting application...' : 'Submit Application to Medical Board'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
