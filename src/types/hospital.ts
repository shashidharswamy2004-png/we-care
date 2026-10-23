export type UserRole = 'patient' | 'doctor' | 'admin';

export type DoctorVerificationStatus =
  | 'pending'
  | 'under_review'
  | 'needs_correction'
  | 'approved'
  | 'rejected';

export type ConsultationMode =
  | 'In-Person'
  | 'Video / Telehealth'
  | 'Both (In-Person & Video)';

/**
 * Stage 1 & 2: Doctor application model
 */
export interface DoctorApplication {
  id: string; // Unique application ID
  userId: string; // Authenticated applicant UID
  email: string;
  fullName: string;
  phone: string;
  medicalRegistrationNumber: string;
  registrationAuthority: string;
  qualifications: string;
  university: string;
  graduationYear: number;
  departmentId: string;
  departmentName: string;
  specialization: string;
  yearsOfExperience: number;
  hospitalOrClinic: string;
  clinicAddress?: string;
  clinicCity?: string;
  latitude?: number;
  longitude?: number;
  biography: string;
  languagesSpoken: string[];
  consultationFee: number;
  consultationMode: ConsultationMode;
  availableDays: string[];
  availableHours: string;
  declaredDocumentNames: string[]; // Document titles declared by applicant (unverified)
  status: DoctorVerificationStatus;
  applicantFeedback?: string; // Public feedback sent to applicant (e.g. correction instructions)
  internalReviewNotes?: string; // Administrator private notes (never exposed on applicant view)
  physicalVerificationOutstanding: boolean; // Flag indicating offline certificate check pending
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  doctorId?: string;
  verificationStatus?: DoctorVerificationStatus;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  qualifications: string;
  experienceYears: number;
  languages: string[];
  rating: number;
  reviewCount: number;
  consultationFee: number;
  about: string;
  specializations: string[];
  education: string[];
  availableDays: string[];
  availableSlots: string[];
  isAvailableToday?: boolean;
  avatarSeed: string;
  userId?: string; // Link to authenticated doctor UID
  isCustomRegistered?: boolean;
  consultationMode?: ConsultationMode;
  hospitalOrClinic?: string;
  verifiedByAdmin?: boolean;
  locationName?: string;
  city?: string;
  clinicAddress?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  headOfDepartment: string;
  keyServices: string[];
  conditionsTreated: string[];
  doctorIds: string[];
  floor: string;
  emergencyCare: boolean;
}

export type AppointmentType =
  | 'In-Person Consultation'
  | 'Video / Telehealth'
  | 'Executive Health Checkup';

export interface Appointment {
  id: string;
  referenceNumber: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  appointmentType: AppointmentType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: string;
  patientGender: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  reasonForVisit: string;
  isFirstVisit: boolean;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  consultationMode?: ConsultationMode;
  createdAt: string;
  patientUid?: string;
  doctorUid?: string;
  notesByDoctor?: string;
  prescription?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'booked' | 'confirmed' | 'rescheduled' | 'cancelled';
  title: string;
  message: string;
  appointmentId: string;
  createdAt: string;
  isRead: boolean;
}

export type SupportTicketCategory = 'Appointment' | 'Account' | 'Website issue' | 'Other';

export interface SupportTicketDraft {
  userId: string;
  userRole: 'patient' | 'doctor';
  userName: string;
  userEmail: string;
  category: SupportTicketCategory;
  message: string;
  imageDataUrl: string;
}

export interface SupportTicketReceipt {
  id: string;
  status: 'open';
  createdAt: string;
}

export type SupportTicketStatus = 'open' | 'resolved';

export interface SupportTicketSummary {
  id: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminPatientRecord {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  isBlocked: boolean;
}

export interface AdminDoctorAccount {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  doctorId?: string;
  verificationStatus?: DoctorVerificationStatus;
  isBlocked: boolean;
}

export interface AdminSupportTicket {
  id: string;
  userId: string;
  userRole: 'patient' | 'doctor';
  userName: string;
  userEmail: string;
  category: SupportTicketCategory;
  message: string;
  imageDataUrl?: string;
  status: SupportTicketStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminDashboardData {
  patients: AdminPatientRecord[];
  doctorAccounts: AdminDoctorAccount[];
  doctors: Doctor[];
  appointments: Appointment[];
  supportTickets: AdminSupportTicket[];
}

export interface Testimonial {
  id: string;
  patientName: string;
  age: number;
  departmentName: string;
  doctorTreated: string;
  quote: string;
  outcome: string;
  date: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  author: string;
  date: string;
}
