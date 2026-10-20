import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DoctorApplication } from '../types/hospital';
import { getDoctorApplication } from '../services/doctorService';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  FileText,
  Building,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Lock,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

interface DoctorApplicationStatusPageProps {
  onNavigateToApply: () => void;
  onNavigateToDashboard: () => void;
  onOpenAuth: () => void;
}

export const DoctorApplicationStatusPage: React.FC<DoctorApplicationStatusPageProps> = ({
  onNavigateToApply,
  onNavigateToDashboard,
  onOpenAuth
}) => {
  const { user } = useAuth();
  const [application, setApplication] = useState<DoctorApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMyApplication = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getDoctorApplication(user.uid);
    setApplication(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMyApplication();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Please sign in to view your doctor credentialing application status.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-600">Retrieving your application status...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">No Doctor Application Found</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            You have not submitted a doctor registration application under account <strong>{user.email}</strong>.
          </p>
        </div>
        <button
          onClick={onNavigateToApply}
          className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
        >
          <span>Submit Doctor Registration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Visual status config
  const statusConfig = {
    pending: {
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Clock,
      title: 'Application Pending Review',
      description: 'Your application has been received and is queued for verification by the hospital credentialing board.'
    },
    under_review: {
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: RefreshCw,
      title: 'Under Active Review',
      description: 'A credentialing officer is actively validating your medical council registration number.'
    },
    needs_correction: {
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: AlertTriangle,
      title: 'Action Required: Needs Correction',
      description: 'The hospital review committee requires updated or corrected information before processing.'
    },
    approved: {
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      title: 'Application Approved & Verified',
      description: 'Congratulations! Your clinical privileges are active and you are published on the WeCare roster.'
    },
    rejected: {
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: AlertCircle,
      title: 'Application Not Approved',
      description: 'The credentialing committee was unable to approve this application.'
    }
  }[application.status] || {
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: HelpCircle,
    title: 'Status Unknown',
    description: 'Status update pending.'
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Applicant Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Doctor Credentialing Status
          </h1>
        </div>
        <button
          onClick={loadMyApplication}
          className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Main Status Display Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${statusConfig.badgeBg}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">{statusConfig.title}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.badgeBg}`}>
                {application.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {statusConfig.description}
            </p>
          </div>
        </div>

        {/* Applicant Targeted Feedback (Internal review notes are strictly hidden) */}
        {application.applicantFeedback && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs space-y-1 text-orange-950">
            <div className="flex items-center gap-1.5 font-bold text-orange-900">
              <MessageSquare className="w-4 h-4 text-orange-700" />
              <span>Message from Credentialing Officer:</span>
            </div>
            <p className="text-orange-900 pl-5.5 leading-relaxed">
              {application.applicantFeedback}
            </p>
          </div>
        )}

        {/* Application Details Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs space-y-3">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-200">
            Submitted Profile Records
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="text-slate-500 block">Applicant Legal Name:</span>
              <strong className="text-slate-900">{application.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Registration License:</span>
              <span className="font-mono text-slate-900 font-semibold">{application.medicalRegistrationNumber}</span>
              <span className="text-[11px] text-slate-500 block">({application.registrationAuthority})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Qualifications & University:</span>
              <span>{application.qualifications} · {application.university}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Department & Specialization:</span>
              <span>{application.departmentName} ({application.specialization})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Consultation Fee & Mode:</span>
              <span>${application.consultationFee} / session · {application.consultationMode}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Submitted Timestamp:</span>
              <span>{new Date(application.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Certificate upload and physical verification notice */}
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Physical Certificate Verification Status:</span>
          </div>
          <p className="leading-relaxed">
            {application.status === 'approved'
              ? 'Physical credential verification has been approved by the hospital credentialing board.'
              : 'Physical certificate verification remains outstanding. Registered document titles are cross-checked against state medical registry archives.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          {application.status === 'needs_correction' && (
            <button
              onClick={onNavigateToApply}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Edit & Resubmit Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {application.status === 'approved' && (
            <button
              onClick={onNavigateToDashboard}
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Open Doctor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {application.status === 'pending' && (
            <p className="text-[11px] text-slate-500 italic">
              Verification typically completes within 24 to 48 business hours.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
