
import React, { useState, useEffect } from 'react';
import { useAuth, PRIMARY_ADMIN_EMAIL } from '../context/AuthContext';
import {
  DoctorApplication,
  DoctorVerificationStatus,
} from '../types/hospital';
import {
  getAllDoctorApplications,
  reviewDoctorApplication,
} from '../services/doctorService';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Lock,
  FileText,
  Calendar,
} from 'lucide-react';

interface AdminVerificationPageProps {
  onDoctorApproved?: () => void;
  onOpenAuth?: () => void;
}

export const AdminVerificationPage: React.FC<AdminVerificationPageProps> = ({
  onDoctorApproved,
  onOpenAuth,
}) => {
  const { user, isAdmin } = useAuth();

  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | DoctorVerificationStatus
  >('all');
  const [selectedApp, setSelectedApp] =
    useState<DoctorApplication | null>(null);

  // Admin verification checklist
  const [verificationChecks, setVerificationChecks] = useState({
    registrationVerified: false,
    qualificationsVerified: false,
    identityVerified: false,
  });

  // Review decision state
  const [reviewAction, setReviewAction] =
    useState<DoctorVerificationStatus | null>(null);
  const [applicantFeedback, setApplicantFeedback] = useState('');
  const [internalReviewNotes, setInternalReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const allChecksCompleted = Object.values(verificationChecks).every(
    Boolean
  );

  const resetVerificationChecks = () => {
    setVerificationChecks({
      registrationVerified: false,
      qualificationsVerified: false,
      identityVerified: false,
    });
    setReviewAction(null);
    setApplicantFeedback('');
    setInternalReviewNotes('');
  };

  const loadData = async () => {
    setLoading(true);

    try {
      const data = await getAllDoctorApplications();
      setApplications(data);

      setSelectedApp((previous) => {
        if (previous) {
          const refreshed = data.find((app) => app.id === previous.id);
          if (refreshed) return refreshed;
        }

        return data.length > 0 ? data[0] : null;
      });
    } catch (error) {
      console.error('Failed to load doctor applications:', error);
      setActionMessage({
        type: 'error',
        text: 'Unable to load doctor applications. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSelectApplication = (app: DoctorApplication) => {
    setSelectedApp(app);
    resetVerificationChecks();
    setActionMessage(null);
  };

  const handleExecuteReview = async () => {
    if (!selectedApp || !reviewAction) return;

    if (!isAdmin) {
      setActionMessage({
        type: 'error',
        text: 'Access denied. Only an authorized administrator can review applications.',
      });
      return;
    }

    if (!allChecksCompleted) {
      setActionMessage({
        type: 'error',
        text: 'Please complete all verification checks before making a decision.',
      });
      return;
    }

    if (reviewAction === 'approved' && !internalReviewNotes.trim()) {
      setActionMessage({
        type: 'error',
        text: 'Please enter private verification notes before approving the doctor.',
      });
      return;
    }

    setSubmittingReview(true);
    setActionMessage(null);

    try {
      await reviewDoctorApplication(selectedApp.id, {
        status: reviewAction,
        applicantFeedback: applicantFeedback.trim(),
        internalReviewNotes: internalReviewNotes.trim(),
        reviewerEmail: user?.email || PRIMARY_ADMIN_EMAIL,
      });

      setActionMessage({
        type: 'success',
        text: `Application for ${selectedApp.fullName} updated to ${reviewAction
          .replace('_', ' ')
          .toUpperCase()}.`,
      });

      const wasApproved = reviewAction === 'approved';

      setReviewAction(null);
      setApplicantFeedback('');
      setInternalReviewNotes('');

      resetVerificationChecks();

      await loadData();

      if (wasApproved && onDoctorApproved) {
        onDoctorApproved();
      }
    } catch (error: any) {
      setActionMessage({
        type: 'error',
        text: error?.message || 'Failed to update the application.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesFilter =
      selectedFilter === 'all' || app.status === selectedFilter;

    const query = searchQuery.toLowerCase();

    const matchesQuery =
      !query ||
      app.fullName.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.medicalRegistrationNumber.toLowerCase().includes(query) ||
      app.departmentName.toLowerCase().includes(query);

    return matchesFilter && matchesQuery;
  });

  const getStatusClasses = (status: DoctorVerificationStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-rose-100 text-rose-800';
      case 'needs_correction':
        return 'bg-orange-100 text-orange-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-teal-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Hospital Administration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Doctor Credential Verification
          </h1>

          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Review each doctor's registration details, qualifications, and
            supporting documents before deciding on the application.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs">
          <div
            className={`w-3 h-3 rounded-full ${
              isAdmin ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          <div>
            <span className="block font-semibold text-slate-800">
              {isAdmin ? 'Authorized Administrator' : 'Read-Only Access'}
            </span>
            <span className="text-slate-500">
              {user?.email || 'Not signed in'}
            </span>
          </div>
        </div>
      </div>

      {/* Access warning */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-950 flex items-start gap-3">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />

          <div>
            <strong>Administrator access required</strong>
            <p className="mt-1">
              You can review application details, but only an authorized
              administrator can submit a decision. Sign in with the
              designated administrator account ({PRIMARY_ADMIN_EMAIL}) using
              the SQL-backed admin login, or create an admin record in the
              database for this email.
            </p>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="mt-3 px-4 py-2 bg-amber-700 text-white rounded-lg"
              >
                Sign In as Admin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start justify-between gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and status filters */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-200">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search doctor name, registration number, or email..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `All (${applications.length})` },
            {
              id: 'pending',
              label: `Pending (${applications.filter((a) => a.status === 'pending').length})`,
            },
            {
              id: 'under_review',
              label: `Under Review (${applications.filter((a) => a.status === 'under_review').length})`,
            },
            {
              id: 'needs_correction',
              label: `Needs Correction (${applications.filter((a) => a.status === 'needs_correction').length})`,
            },
            {
              id: 'approved',
              label: `Approved (${applications.filter((a) => a.status === 'approved').length})`,
            },
            {
              id: 'rejected',
              label: `Rejected (${applications.filter((a) => a.status === 'rejected').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedFilter(tab.id as any);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                selectedFilter === tab.id
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
          <p className="text-sm text-slate-500 mt-3">
            Loading doctor applications...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && applications.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />

          <h3 className="text-lg font-bold text-slate-800 mt-3">
            No Doctor Applications
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Doctor applications will appear here after they are submitted.
          </p>

          <button
            onClick={() => void loadData()}
            className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-lg"
          >
            Refresh Applications
          </button>
        </div>
      )}

      {/* No filter matches */}
      {!loading && applications.length > 0 && filteredApps.length === 0 && (
        <div className="text-center py-10 text-slate-500">
          No applications match your search or selected filter.
        </div>
      )}

      {/* Applications and selected application details */}
      {!loading && filteredApps.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Application list */}
          <div className="lg:col-span-5 space-y-3">
            {filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;

              return (
                <button
                  type="button"
                  key={app.id}
                  onClick={() => handleSelectApplication(app)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {app.fullName}
                      </h3>

                      <p className="text-xs text-teal-700 mt-1">
                        {app.departmentName} · {app.specialization}
                      </p>

                      <p className="text-xs text-slate-500 mt-1 break-all">
                        {app.email}
                      </p>

                      <p className="text-xs font-mono text-slate-500 mt-1">
                        Registration: {app.medicalRegistrationNumber}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${getStatusClasses(
                        app.status
                      )}`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between gap-2 text-xs text-slate-500">
                    <span>{app.yearsOfExperience} years experience</span>
                    <span>Fee: {app.consultationFee}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected application details */}
          {selectedApp && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 space-y-6">
              {/* Doctor header */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedApp.fullName}
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${getStatusClasses(
                      selectedApp.status
                    )}`}
                  >
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-teal-700 mt-1">
                  {selectedApp.specialization} · {selectedApp.departmentName}
                </p>

                <p className="text-xs text-slate-500 mt-2 break-all">
                  Applicant ID: {selectedApp.userId}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Email: {selectedApp.email}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Phone: {selectedApp.phone}
                </p>
              </div>

              {/* Verification warning */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-700" />

                <p>
                  <strong>Review required:</strong> The details entered by
                  the applicant are not independently verified. Check the
                  registration with the appropriate authority and examine
                  supporting evidence before approving the application.
                </p>
              </div>

              {/* Registration and qualification details */}
              <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">
                  Registration and Qualifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">
                      Medical Registration Number
                    </p>
                    <p className="font-semibold text-slate-900 mt-1 break-all">
                      {selectedApp.medicalRegistrationNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Registration Authority
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedApp.registrationAuthority}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Qualifications
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedApp.qualifications}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      University and Graduation Year
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedApp.university} ({selectedApp.graduationYear})
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Hospital or Clinic
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedApp.hospitalOrClinic}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500">
                      Clinic address
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {[selectedApp.clinicAddress, selectedApp.clinicCity].filter(Boolean).join(', ') || 'Not provided'}
                    </p>
                    {typeof selectedApp.latitude === 'number' && typeof selectedApp.longitude === 'number' && (
                      <p className="mt-1 text-xs text-slate-500">
                        Map pin: {selectedApp.latitude.toFixed(5)}, {selectedApp.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Years of Experience
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedApp.yearsOfExperience}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Consultation Mode
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedApp.consultationMode}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Consultation Fee
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedApp.consultationFee}
                    </p>
                  </div>
                </div>
              </section>

              {/* Biography and availability */}
              <section className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">
                  Professional Biography
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {selectedApp.biography || 'No biography provided.'}
                </p>

                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Available days:</strong>{' '}
                    {selectedApp.availableDays?.join(', ') || 'Not provided'}
                    <br />
                    <strong>Available hours:</strong>{' '}
                    {selectedApp.availableHours || 'Not provided'}
                  </p>
                </div>
              </section>

              {/* Declared documents */}
              <section className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-700" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Declared Documents
                  </h3>
                </div>

                {selectedApp.declaredDocumentNames?.length ? (
                  <div className="space-y-2">
                    {selectedApp.declaredDocumentNames.map((name, index) => (
                      <div
                        key={`${name}-${index}`}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <span className="text-sm text-slate-800">{name}</span>
                        <span className="text-xs text-amber-700">
                          Not verified
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No document names were declared.
                  </p>
                )}

                <p className="text-xs text-slate-500">
                  Document names are not the actual certificates. Review
                  the original evidence separately before marking documents
                  as verified.
                </p>
              </section>

              {/* Existing applicant feedback */}
              {selectedApp.applicantFeedback && (
                <section className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <h3 className="font-bold text-sm text-blue-900">
                    Previous Feedback to Applicant
                  </h3>
                  <p className="text-sm text-blue-800 mt-2">
                    {selectedApp.applicantFeedback}
                  </p>
                </section>
              )}

              {/* Verification checklist */}
              <section className="pt-5 border-t border-slate-200 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    Verify Doctor Credentials
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Complete all three checks after reviewing the evidence.
                    Decision controls will appear only after the checklist
                    is complete.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-teal-700"
                      checked={verificationChecks.registrationVerified}
                      onChange={(event) =>
                        setVerificationChecks((previous) => ({
                          ...previous,
                          registrationVerified: event.target.checked,
                        }))
                      }
                    />
                    <span>
                      <strong>Registration verified:</strong> I checked the
                      medical registration number with the appropriate
                      licensing authority.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-teal-700"
                      checked={verificationChecks.qualificationsVerified}
                      onChange={(event) =>
                        setVerificationChecks((previous) => ({
                          ...previous,
                          qualificationsVerified: event.target.checked,
                        }))
                      }
                    />
                    <span>
                      <strong>Qualifications verified:</strong> I checked
                      the qualifications, university, and graduation details.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-teal-700"
                      checked={verificationChecks.identityVerified}
                      onChange={(event) =>
                        setVerificationChecks((previous) => ({
                          ...previous,
                          identityVerified: event.target.checked,
                        }))
                      }
                    />
                    <span>
                      <strong>Identity and documents verified:</strong> I
                      checked the doctor's identity and supporting evidence.
                    </span>
                  </label>
                </div>

                <div
                  className={`p-4 rounded-xl border text-sm ${
                    allChecksCompleted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {allChecksCompleted ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>
                        All checks marked complete. You may now choose a
                        review decision.
                      </span>
                    </div>
                  ) : (
                    <span>
                      Complete all three checks to unlock the decision
                      controls.
                    </span>
                  )}
                </div>

                {/* Decision controls only after checklist completion */}
                {allChecksCompleted && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={
                          !isAdmin ||
                          submittingReview ||
                          selectedApp.status === 'approved'
                        }
                        onClick={() => {
                          setReviewAction('approved');
                          setApplicantFeedback(
                            'Your application has been approved following credential review.'
                          );
                          setActionMessage(null);
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={
                          !isAdmin ||
                          submittingReview ||
                          selectedApp.status === 'rejected'
                        }
                        onClick={() => {
                          setReviewAction('rejected');
                          setApplicantFeedback(
                            'Your application was not approved following credential review. Please contact the hospital for further information.'
                          );
                          setActionMessage(null);
                        }}
                        className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={!isAdmin || submittingReview}
                        onClick={() => {
                          setReviewAction('needs_correction');
                          setApplicantFeedback(
                            'Please review the feedback and provide the requested corrections.'
                          );
                          setActionMessage(null);
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Request Correction
                      </button>

                      <button
                        type="button"
                        disabled={!isAdmin || submittingReview}
                        onClick={() => {
                          setReviewAction('under_review');
                          setApplicantFeedback(
                            'Your application is still under review. We will update you when the review is complete.'
                          );
                          setActionMessage(null);
                        }}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Keep Under Review
                      </button>
                    </div>

                    {/* Confirm decision */}
                    {reviewAction && (
                      <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-4">
                        <h4 className="font-bold text-slate-900">
                          Confirm Decision:{' '}
                          {reviewAction.replace('_', ' ').toUpperCase()}
                        </h4>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Feedback to Doctor
                          </label>
                          <textarea
                            rows={3}
                            value={applicantFeedback}
                            onChange={(event) =>
                              setApplicantFeedback(event.target.value)
                            }
                            placeholder="Enter feedback visible to the applicant..."
                            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Private Admin Verification Notes
                          </label>
                          <textarea
                            rows={2}
                            value={internalReviewNotes}
                            onChange={(event) =>
                              setInternalReviewNotes(event.target.value)
                            }
                            placeholder="Record what you verified and the evidence reference..."
                            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                          />
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewAction(null)}
                            disabled={submittingReview}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-40"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleExecuteReview()}
                            disabled={
                              !isAdmin ||
                              submittingReview ||
                              !allChecksCompleted
                            }
                            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {submittingReview
                              ? 'Saving Decision...'
                              : 'Confirm and Save Decision'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
