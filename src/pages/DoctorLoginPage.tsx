import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDoctorApplication } from '../services/doctorService';
import {
  Stethoscope,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';

interface DoctorLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToApply: () => void;
  onNavigateToStatus: () => void;
}

export const DoctorLoginPage: React.FC<DoctorLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToApply,
  onNavigateToStatus
}) => {
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{
    status: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusNotice(null);
    setLoading(true);

    try {
      await signInWithEmail(email.trim(), password);

      // Verify application and approval status immediately with the authenticated user
      // Note: onAuthStateChanged will update user, but we can also fetch application directly
      onLoginSuccess();
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/user-not-found') {
        setErrorMessage('No WeCare account found for this email.');
      } else {
        setErrorMessage(err?.message || 'Login failed. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
          <Stethoscope className="w-7 h-7 text-teal-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Physician Portal Sign In
        </h1>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Access your clinical outpatient schedule, patient visits, and consultation fee controls.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusNotice && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Status: {statusNotice.status.toUpperCase()}</span>
            </div>
            <p>{statusNotice.message}</p>
            <button
              onClick={onNavigateToStatus}
              className="text-teal-700 underline font-semibold cursor-pointer"
            >
              View Application Details →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Physician Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="doctor@hospital.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Doctor Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
          <p className="text-slate-500">
            Not yet registered on the attending medical roster?
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onNavigateToApply}
              className="text-teal-700 font-bold hover:underline cursor-pointer"
            >
              Join as a Doctor
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={onNavigateToStatus}
              className="text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Track Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
