import React, { createContext, useContext, useState, useEffect } from 'react';
import { sqlApi } from '../lib/sqlClient';
import { UserRole, DoctorVerificationStatus } from '../types/hospital';

export const PRIMARY_ADMIN_EMAIL = 'shashidharswamy2004@gmail.com';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  doctorId?: string;
  verificationStatus?: DoctorVerificationStatus;
  isBlocked?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  role: UserRole;
  isDoctor: boolean;
  isAdmin: boolean;
  doctorStatus: DoctorVerificationStatus | null;
  activeDoctorId: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithPhoneNumber: (phone: string, pass: string) => Promise<void>;
  signInWithPhoneOtp: (phone: string, otp: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signUpWithPhoneNumber: (phone: string, pass: string, name: string | undefined, email: string | undefined, otp: string) => Promise<void>;
  sendMobileOtp: (phone: string) => Promise<{ message: string; otp?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resetPasswordWithMobile: (phone: string, otp: string, newPassword: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const SESSION_KEY = 'wecare_sql_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('patient');
  const [doctorStatus, setDoctorStatus] = useState<DoctorVerificationStatus | null>(null);
  const [activeDoctorId, setActiveDoctorId] = useState<string | null>(null);

  const persistUser = (nextUser: AppUser | null) => {
    if (nextUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const fetchProfileDetails = async (currentUser: AppUser) => {
    const isDesignatedAdmin = currentUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    if (isDesignatedAdmin) {
      setRole('admin');
    }

    try {
      const response = await sqlApi.getUserProfile(currentUser.uid);
      const profile = response?.user || currentUser;
      if (profile.isBlocked) {
        setUser(null);
        setRole('patient');
        setDoctorStatus(null);
        setActiveDoctorId(null);
        persistUser(null);
        return;
      }
      const nextRole = isDesignatedAdmin ? 'admin' : (profile.role || 'patient');
      const resolvedRole = profile.role === 'patient' && profile.verificationStatus === 'approved'
        ? 'doctor'
        : nextRole;
      setRole(resolvedRole);
      setActiveDoctorId(profile.doctorId || null);
      setDoctorStatus(profile.verificationStatus || null);

      const mergedUser: AppUser = {
        ...currentUser,
        ...profile,
        role: resolvedRole
      };
      setUser(mergedUser);
      persistUser(mergedUser);
    } catch (err) {
      console.warn('Could not fetch SQL profile, using session state:', err);
      const fallbackRole = isDesignatedAdmin ? 'admin' : 'patient';
      setRole(fallbackRole);
      setUser(currentUser);
      persistUser(currentUser);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AppUser;
          setUser(parsed);
          setRole(parsed.role || 'patient');
          if (parsed.doctorId) {
            setActiveDoctorId(parsed.doctorId);
          }
          await fetchProfileDetails(parsed);
        }
      } catch (error) {
        console.warn('Session restore failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const refreshUserProfile = async () => {
    if (user) {
      await fetchProfileDetails(user);
    }
  };

  const signInWithGoogle = async () => {
    const demoUser: AppUser = {
      uid: `google-${Date.now()}`,
      email: 'google-user@wecare.local',
      displayName: 'Google User',
      role: 'patient',
      createdAt: new Date().toISOString()
    };
    setUser(demoUser);
    setRole('patient');
    persistUser(demoUser);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const response = await sqlApi.signIn(email.trim(), pass);
    const profile = response.user;
    const mergedUser: AppUser = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName || profile.email.split('@')[0],
      role: profile.role || 'patient',
      photoURL: profile.photoURL,
      doctorId: profile.doctorId,
      verificationStatus: profile.verificationStatus,
      isBlocked: Boolean(profile.isBlocked),
      createdAt: profile.createdAt
    };
    setUser(mergedUser);
    setRole(mergedUser.role);
    persistUser(mergedUser);
    await fetchProfileDetails(mergedUser);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const response = await sqlApi.signUp(email.trim(), pass, name?.trim());
    const profile = response.user;
    const mergedUser: AppUser = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName || profile.email.split('@')[0],
      role: profile.role || 'patient',
      photoURL: profile.photoURL,
      doctorId: profile.doctorId,
      verificationStatus: profile.verificationStatus,
      isBlocked: Boolean(profile.isBlocked),
      createdAt: profile.createdAt
    };
    setUser(mergedUser);
    setRole(mergedUser.role);
    persistUser(mergedUser);
  };

  const signInWithPhoneNumber = async (phone: string, pass: string) => {
    const response = await sqlApi.signInWithPhone(phone.trim(), pass);
    const profile = response.user;
    const mergedUser: AppUser = {
      uid: profile.uid,
      email: profile.email || `${phone.trim()}@wecare.local`,
      displayName: profile.displayName || profile.email?.split('@')[0] || 'Patient',
      role: profile.role || 'patient',
      photoURL: profile.photoURL,
      doctorId: profile.doctorId,
      verificationStatus: profile.verificationStatus,
      isBlocked: Boolean(profile.isBlocked),
      createdAt: profile.createdAt
    };
    setUser(mergedUser);
    setRole(mergedUser.role);
    persistUser(mergedUser);
    await fetchProfileDetails(mergedUser);
  };

  const signInWithPhoneOtp = async (phone: string, otp: string) => {
    const response = await sqlApi.verifyMobileOtp(phone.trim(), otp.trim());
    const profile = response.user;
    const mergedUser: AppUser = {
      uid: profile.uid,
      email: profile.email || `${phone.trim()}@wecare.local`,
      displayName: profile.displayName || profile.email?.split('@')[0] || 'Patient',
      role: profile.role || 'patient',
      photoURL: profile.photoURL,
      doctorId: profile.doctorId,
      verificationStatus: profile.verificationStatus,
      isBlocked: Boolean(profile.isBlocked),
      createdAt: profile.createdAt
    };
    setUser(mergedUser);
    setRole(mergedUser.role);
    persistUser(mergedUser);
    await fetchProfileDetails(mergedUser);
  };

  const signUpWithPhoneNumber = async (phone: string, pass: string, name: string | undefined, email: string | undefined, otp: string) => {
    const response = await sqlApi.signUpWithPhone(phone.trim(), pass, name?.trim(), email?.trim(), otp.trim());
    const profile = response.user;
    const mergedUser: AppUser = {
      uid: profile.uid,
      email: profile.email || `${phone.trim()}@wecare.local`,
      displayName: profile.displayName || name || 'Patient',
      role: profile.role || 'patient',
      photoURL: profile.photoURL,
      doctorId: profile.doctorId,
      verificationStatus: profile.verificationStatus,
      createdAt: profile.createdAt
    };
    setUser(mergedUser);
    setRole(mergedUser.role);
    persistUser(mergedUser);
  };

  const sendMobileOtp = async (phone: string) => {
    return sqlApi.sendMobileOtp(phone.trim());
  };

  const logout = async () => {
    setUser(null);
    setRole('patient');
    setDoctorStatus(null);
    setActiveDoctorId(null);
    persistUser(null);
  };

  const resetPassword = async (email: string) => {
    await sqlApi.resetPassword(email.trim());
  };

  const resetPasswordWithMobile = async (phone: string, otp: string, newPassword: string) => {
    await sqlApi.resetPasswordWithMobile(phone.trim(), otp.trim(), newPassword);
  };

  const isDoctor = role === 'doctor' && doctorStatus === 'approved';
  const isAdmin = role === 'admin' || user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isDoctor,
        isAdmin,
        doctorStatus,
        activeDoctorId,
        signInWithGoogle,
        signInWithEmail,
        signInWithPhoneNumber,
        signInWithPhoneOtp,
        signUpWithEmail,
        signUpWithPhoneNumber,
        sendMobileOtp,
        logout,
        resetPassword,
        resetPasswordWithMobile,
        refreshUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
