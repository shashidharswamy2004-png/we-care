import React, { useState } from 'react';
import { PRIMARY_ADMIN_EMAIL, useAuth } from '../context/AuthContext';
import { sqlApi } from '../lib/sqlClient';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, Stethoscope, ShieldCheck, Phone } from 'lucide-react';
import { UserRole } from '../types/hospital';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onNavigateToApply?: () => void;
  onNavigateToDashboard?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onNavigateToApply,
  onNavigateToDashboard
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signInWithPhoneNumber,
    signInWithPhoneOtp,
    signUpWithEmail,
    signUpWithPhoneNumber,
    resetPassword,
    resetPasswordWithMobile,
    sendMobileOtp
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [targetRole, setTargetRole] = useState<UserRole>('patient');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password' | 'email' | 'mobile'>(
    defaultMode === 'signup' ? 'mobile' : 'otp'
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '').slice(-10);

  const validatePassword = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[a-z]/.test(trimmed)) {
      return 'Password must include at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(trimmed)) {
      return 'Password must include at least one uppercase letter.';
    }
    if (!/\d/.test(trimmed)) {
      return 'Password must include at least one number.';
    }
    return null;
  };

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPhone('');
    setPassword('');
    setOtp('');
    setName('');
    setOtpSent(false);
  };

  const getAuthErrorMessage = (err: any): string =>
    err?.message || 'Authentication failed. Please check your credentials and try again.';

  const navigateAfterDoctorSignIn = () => {
    if (targetRole === 'doctor') {
      (onNavigateToDashboard || onNavigateToApply)?.();
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
      if (targetRole === 'doctor' && onNavigateToApply) {
        onNavigateToApply();
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      setError('Please enter a valid mobile number before requesting OTP.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await sendMobileOtp(normalizedPhone);
      setOtpSent(true);
      setSuccessMsg(response.message || `OTP sent to ${normalizedPhone}.`);
    } catch (err: any) {
      setError(err?.message || 'Unable to send OTP right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!normalizedPhone) {
        setError('Please provide a mobile number to reset your password.');
        return;
      }

      const passwordError = validatePassword(password);
      if (!otp.trim()) {
        setSubmitting(true);
        try {
          const response = await sendMobileOtp(normalizedPhone);
          setOtpSent(true);
          setSuccessMsg(response.message || `OTP sent to ${normalizedPhone}.`);
        } catch (err: any) {
          setError(err?.message || 'Unable to send OTP right now. Please try again.');
        } finally {
          setSubmitting(false);
        }
        return;
      }

      if (passwordError) {
        setError(passwordError);
        return;
      }

      setSubmitting(true);
      try {
        await resetPasswordWithMobile(normalizedPhone, otp.trim(), password);
        setMode('login');
        setLoginMethod('password');
        setOtp('');
        setPassword('');
        setSuccessMsg('Password updated successfully. You can now sign in with your mobile number and new password.');
      } catch (err: any) {
        setError(err?.message || 'Unable to reset your password. Please try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (mode === 'login' && loginMethod === 'password') {
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!normalizedPhone) {
        setError('Please enter your mobile number.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      setSubmitting(true);
      try {
        await signInWithPhoneNumber(normalizedPhone, password);
        onClose();
        navigateAfterDoctorSignIn();
      } catch (err: any) {
        setError(getAuthErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if ((mode === 'login' && loginMethod === 'otp') || (mode === 'signup' && loginMethod === 'mobile')) {
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!normalizedPhone) {
        setError('Please enter your mobile number.');
        return;
      }

      if (mode === 'login') {
        if (!otp.trim()) {
          setError('Please enter the OTP sent to your mobile number.');
          return;
        }

        setSubmitting(true);
        try {
          await signInWithPhoneOtp(normalizedPhone, otp.trim());
          onClose();
          navigateAfterDoctorSignIn();
        } catch (err: any) {
          setError(getAuthErrorMessage(err));
        } finally {
          setSubmitting(false);
        }
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (!name.trim()) {
        setError('Please provide your full name.');
        return;
      }

      if (!otp.trim()) {
        setSubmitting(true);
        try {
          const response = await sendMobileOtp(normalizedPhone);
          setOtpSent(true);
          setSuccessMsg(response.message || `OTP sent to ${normalizedPhone}.`);
        } catch (err: any) {
          setError(err?.message || 'Unable to send OTP right now. Please try again.');
        } finally {
          setSubmitting(false);
        }
        return;
      }

      setSubmitting(true);
      try {
        await signUpWithPhoneNumber(normalizedPhone, password, name.trim(), email.trim() || undefined, otp.trim());
        onClose();
        if (targetRole === 'doctor' && onNavigateToApply) {
          onNavigateToApply();
        }
      } catch (err: any) {
        setError(getAuthErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
        onClose();
        navigateAfterDoctorSignIn();
      } else if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, name.trim());
        onClose();
        if (targetRole === 'doctor' && onNavigateToApply) {
          onNavigateToApply();
        }
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-teal-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 border border-teal-600 flex items-center justify-center font-bold text-white text-base">
              +
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">WeCare Portal Access</h3>
              <p className="text-xs text-teal-200">Secure member authentication</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-100 border-b border-slate-200 flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setTargetRole('patient');
              if (mode === 'login') setLoginMethod('otp');
              setError(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              targetRole === 'patient'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Access</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetRole('doctor');
              if (mode === 'login') setLoginMethod('otp');
              setError(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              targetRole === 'doctor'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor & Staff</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetRole('admin');
              setMode('login');
              setLoginMethod('email');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              targetRole === 'admin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Access</span>
          </button>
        </div>

        {mode !== 'forgot' && targetRole !== 'admin' && (
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setMode('login');
                setLoginMethod('otp');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer text-center ${
                mode === 'login'
                  ? 'bg-white text-teal-800 border-b-2 border-teal-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setLoginMethod('mobile');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer text-center ${
                mode === 'signup'
                  ? 'bg-white text-teal-800 border-b-2 border-teal-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode !== 'forgot' && targetRole !== 'admin' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-1 flex gap-1">
              {mode === 'login' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setOtp('');
                      setOtpSent(false);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      loginMethod === 'otp' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    OTP Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('password');
                      setOtp('');
                      setOtpSent(false);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      loginMethod === 'password' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Password Login
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      loginMethod === 'email' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Email &amp; Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('mobile')}
                    className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      loginMethod === 'mobile' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Mobile + OTP
                  </button>
                </>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
                  or continue with {loginMethod === 'mobile' ? 'mobile' : 'email'}
                </span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name {targetRole === 'doctor' ? '(e.g. Dr. Arthur Vance)' : ''}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={targetRole === 'doctor' ? 'Dr. Arthur Vance' : 'e.g. Eleanor Davis'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {mode === 'forgot' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={submitting}
                      className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OTP Code</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Use at least 8 characters with one uppercase, one lowercase, and one number.</p>
                </div>
              </div>
            ) : (mode === 'login' && targetRole === 'admin') ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrator Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder={PRIMARY_ADMIN_EMAIL}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            ) : ((mode === 'login' && (loginMethod === 'otp' || loginMethod === 'password')) || (mode === 'signup' && loginMethod === 'mobile')) ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
                {loginMethod !== 'password' && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={submitting}
                      className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder={targetRole === 'doctor' ? 'doctor@wecarehospital.org' : 'patient@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && loginMethod === 'mobile' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email address for updates</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Keep this current for future appointment and account updates. OTP verification stays on your mobile number.
                </p>
              </div>
            )}

            {((mode === 'login' && loginMethod === 'otp' && otpSent) || (mode === 'signup' && loginMethod === 'mobile')) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">OTP Code</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {((loginMethod === 'email' && (mode === 'signup' || (mode === 'login' && targetRole === 'admin'))) || (loginMethod === 'password' && mode === 'login')) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {mode === 'login' && targetRole !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-medium text-teal-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-slate-500 mt-1">Must be at least 6 characters.</p>
                )}
              </div>
            )}

            {loginMethod === 'mobile' && mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-slate-500 mt-1">Use at least 8 characters with one uppercase, one lowercase, and one number.</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              <span>
                {submitting
                  ? 'Processing...'
                  : mode === 'login'
                    ? `Sign In as ${targetRole === 'doctor' ? 'Doctor' : targetRole === 'admin' ? 'Administrator' : 'Patient'}`
                    : mode === 'signup'
                      ? `Register as ${targetRole === 'doctor' ? 'Physician' : 'Patient'}`
                      : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {targetRole === 'doctor' && mode === 'login' && onNavigateToApply && (
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-center space-y-1.5">
              <p className="text-xs text-teal-900 font-semibold">Applying to join WeCare Medical Staff?</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToApply();
                }}
                className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Submit Doctor Credentials & Licensure →
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-teal-700 hover:underline cursor-pointer font-medium"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          <span>Secure access for patient and medical staff portals.</span>
        </div>
      </div>
    </div>
  );
};
