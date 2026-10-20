import type { AdminDashboardData, AdminSupportTicket, SupportTicketStatus, SupportTicketSummary } from '../types/hospital';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const rawText = await response.text();

  if (!response.ok) {
    let message = 'Request failed';
    if (rawText) {
      try {
        const errorBody = JSON.parse(rawText);
        message = errorBody?.message || errorBody?.error || message;
      } catch {
        message = rawText;
      }
    }
    throw new Error(message);
  }

  if (!rawText) {
    return {} as T;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    return {} as T;
  }
}

export const sqlApi = {
  async signIn(email: string, password: string) {
    return api<{ user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async signUp(email: string, password: string, name?: string) {
    return api<{ user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  },

  async signInWithPhone(phone: string, password: string) {
    return api<{ user: any }>('/auth/mobile/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
  },

  async signUpWithPhone(phone: string, password: string, name: string | undefined, email: string | undefined, otp: string) {
    return api<{ user: any }>('/auth/mobile/signup', {
      method: 'POST',
      body: JSON.stringify({ phone, password, name, email, otp })
    });
  },

  async sendMobileOtp(phone: string) {
    return api<{ message: string; otp?: string }>('/auth/mobile/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  async verifyMobileOtp(phone: string, otp: string) {
    return api<{ user: any }>('/auth/mobile/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  },

  async getUserProfile(uid: string) {
    return api<{ user: any }>(`/users/${uid}`);
  },

  async resetPassword(email: string) {
    return api<{ message?: string }>('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPasswordWithMobile(phone: string, otp: string, newPassword: string) {
    return api<{ message: string }>('/auth/mobile/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, newPassword })
    });
  },

  async submitDoctorApplication(application: any) {
    return api<{ application: any }>('/doctor-applications', {
      method: 'POST',
      body: JSON.stringify(application)
    });
  },

  async getDoctorApplication(userId: string) {
    return api<{ application: any }>(`/doctor-applications/${userId}`);
  },

  async getAllDoctorApplications() {
    return api<{ applications: any[] }>('/doctor-applications');
  },

  async reviewDoctorApplication(applicationId: string, decision: any) {
    return api<{ application: any }>(`/doctor-applications/${applicationId}/review`, {
      method: 'POST',
      body: JSON.stringify(decision)
    });
  },

  async fetchVerifiedDoctors() {
    return api<{ doctors: any[] }>('/doctors');
  },

  async fetchDoctorAppointments(doctorId: string, doctorUid?: string) {
    const qs = new URLSearchParams();
    if (doctorId) qs.set('doctorId', doctorId);
    if (doctorUid) qs.set('doctorUid', doctorUid);
    return api<{ appointments: any[] }>(`/appointments${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  async saveAppointment(appointment: any) {
    return api<{ appointment: any }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment)
    });
  },

  async updateAppointmentDetails(appointmentId: string, updates: any) {
    return api<{ appointment: any }>(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async createSupportTicket(ticket: import('../types/hospital').SupportTicketDraft) {
    return api<{ ticket: import('../types/hospital').SupportTicketReceipt }>('/support-tickets', {
      method: 'POST',
      body: JSON.stringify(ticket)
    });
  },

  async getMySupportTickets(userId: string) {
    return api<{ tickets: SupportTicketSummary[] }>(`/support-tickets?userId=${encodeURIComponent(userId)}`);
  },

  async getAdminDashboard() {
    return api<AdminDashboardData>('/admin/dashboard');
  },

  async getSupportTicket(ticketId: string) {
    return api<{ ticket: AdminSupportTicket }>(`/support-tickets/${ticketId}`);
  },

  async updateSupportTicketStatus(ticketId: string, status: SupportTicketStatus) {
    return api<{ ticket: AdminSupportTicket }>(`/support-tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async setAccountBlocked(uid: string, isBlocked: boolean, adminUid: string) {
    return api<{ uid: string; isBlocked: boolean }>(`/admin/users/${encodeURIComponent(uid)}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked, adminUid })
    });
  }
};
