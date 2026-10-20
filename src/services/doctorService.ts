import { sqlApi } from '../lib/sqlClient';
import {
  DoctorApplication,
  Doctor,
  Appointment,
  DoctorVerificationStatus
} from '../types/hospital';

const LOCAL_APPLICATIONS_KEY = 'wecare_doctor_applications_cache';
const LOCAL_CUSTOM_DOCTORS_KEY = 'wecare_custom_doctors_cache';

export async function submitDoctorApplication(
  applicationData: Omit<DoctorApplication, 'status' | 'createdAt' | 'updatedAt' | 'physicalVerificationOutstanding'>
): Promise<DoctorApplication> {
  const now = new Date().toISOString();
  const application: DoctorApplication = {
    ...applicationData,
    status: 'pending',
    physicalVerificationOutstanding: true,
    createdAt: now,
    updatedAt: now
  };

  try {
    const response = await sqlApi.submitDoctorApplication(application);
    const saved = response.application || application;
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify([saved, ...getLocalDoctorApplications().filter((a) => a.id !== saved.id)]));
    return saved;
  } catch (error) {
    console.warn('SQL doctor application save failed, using local fallback:', error);
    const cached = getLocalDoctorApplications();
    const updated = [application, ...cached.filter((a) => a.id !== application.id)];
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(updated));
    return application;
  }
}

export async function getDoctorApplication(userId: string): Promise<DoctorApplication | null> {
  try {
    const response = await sqlApi.getDoctorApplication(userId);
    if (response?.application) {
      return response.application as DoctorApplication;
    }
  } catch (error) {
    console.warn('Could not fetch doctor application from SQL backend:', error);
  }

  const cached = getLocalDoctorApplications();
  return cached.find((a) => a.userId === userId || a.id === userId) || null;
}

export async function getAllDoctorApplications(): Promise<DoctorApplication[]> {
  try {
    const response = await sqlApi.getAllDoctorApplications();
    if (response?.applications?.length) {
      return response.applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (error) {
    console.warn('Could not list applications from SQL backend:', error);
  }

  return getLocalDoctorApplications();
}

export async function reviewDoctorApplication(
  applicationId: string,
  decision: {
    status: DoctorVerificationStatus;
    applicantFeedback?: string;
    internalReviewNotes?: string;
    reviewerEmail: string;
  }
): Promise<void> {
  const reviewedAt = new Date().toISOString();
  const payload = {
    status: decision.status,
    applicantFeedback: decision.applicantFeedback || '',
    internalReviewNotes: decision.internalReviewNotes || '',
    reviewerEmail: decision.reviewerEmail,
    reviewedAt,
    updatedAt: reviewedAt
  };

  try {
    await sqlApi.reviewDoctorApplication(applicationId, payload);
  } catch (error) {
    console.warn('SQL review failed, using local cache update:', error);
  }

  const apps = getLocalDoctorApplications().map((a) =>
    a.id === applicationId ? { ...a, ...payload } : a
  );
  localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(apps));
}

export async function updateDoctorPractice(
  doctorId: string,
  updates: Partial<Pick<Doctor, 'consultationFee' | 'availableDays' | 'availableSlots' | 'isAvailableToday'>>
): Promise<void> {
  const customDocs = getLocalCustomDoctors().map((d) =>
    d.id === doctorId ? { ...d, ...updates } : d
  );
  localStorage.setItem(LOCAL_CUSTOM_DOCTORS_KEY, JSON.stringify(customDocs));
}

export async function fetchVerifiedDoctors(): Promise<Doctor[]> {
  try {
    const response = await sqlApi.fetchVerifiedDoctors();
    if (response?.doctors?.length) {
      localStorage.setItem(LOCAL_CUSTOM_DOCTORS_KEY, JSON.stringify(response.doctors));
      return response.doctors;
    }
  } catch (error) {
    console.warn('Could not fetch doctors from SQL backend:', error);
  }

  return getLocalCustomDoctors();
}

export async function fetchDoctorAppointments(
  doctorId: string,
  doctorUid?: string
): Promise<Appointment[]> {
  try {
    const response = await sqlApi.fetchDoctorAppointments(doctorId, doctorUid);
    if (response?.appointments?.length) {
      return response.appointments.filter((data: Appointment) => data.doctorId === doctorId || (doctorUid && data.doctorUid === doctorUid));
    }
  } catch (error) {
    console.warn('Could not fetch appointments from SQL backend:', error);
  }
  return [];
}

export async function updateAppointmentDetails(
  appointmentId: string,
  updates: Partial<Pick<Appointment, 'status' | 'notesByDoctor' | 'prescription' | 'timeSlot' | 'date'>>
): Promise<void> {
  try {
    await sqlApi.updateAppointmentDetails(appointmentId, updates);
  } catch (error) {
    console.warn('Could not update appointment in SQL backend:', error);
  }
}

export async function saveAppointment(appointment: Appointment): Promise<void> {
  try {
    await sqlApi.saveAppointment(appointment);
  } catch (error) {
    console.warn('Could not save appointment to SQL backend:', error);
  }
}

function getLocalDoctorApplications(): DoctorApplication[] {
  try {
    const stored = localStorage.getItem(LOCAL_APPLICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getLocalCustomDoctors(): Doctor[] {
  try {
    const stored = localStorage.getItem(LOCAL_CUSTOM_DOCTORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
