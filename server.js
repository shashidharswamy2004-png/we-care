import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import 'dotenv/config';
import twilio from 'twilio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SENDER_NUMBER = process.env.TWILIO_SENDER_NUMBER;
const hasTwilioCredentials = /^AC[a-f\d]{32}$/i.test(TWILIO_ACCOUNT_SID || '')
  && Boolean(TWILIO_AUTH_TOKEN && !TWILIO_AUTH_TOKEN.startsWith('YOUR_'));
const twilioClient = hasTwilioCredentials ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;
if (!twilioClient) {
  console.warn('Twilio is not configured; OTP requests will use demo mode.');
}
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'wecare.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const seedDoctors = [
  {
    id: 'doc-1',
    name: 'Dr. Aisha Patel',
    title: 'Consultant Cardiology',
    departmentId: 'cardiology',
    departmentName: 'Cardiology',
    qualifications: 'MBBS, MD Cardiology',
    experienceYears: 12,
    languages: ['English', 'Hindi'],
    rating: 4.9,
    reviewCount: 128,
    consultationFee: 1200,
    about: 'Specializes in preventive heart care and arrhythmia management.',
    specializations: ['Cardiology'],
    education: ['MBBS - AIIMS Delhi', 'MD Cardiology - PGI Chandigarh'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'AishaPatel',
    userId: 'doctor-aisha',
    isCustomRegistered: true,
    consultationMode: 'Both (In-Person & Video)',
    hospitalOrClinic: 'WeCare Heart Institute',
    verifiedByAdmin: true
  },
  {
    id: 'doc-2',
    name: 'Dr. Ravi Nair',
    title: 'Senior Orthopedic Consultant',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics',
    qualifications: 'MBBS, MS Orthopedics',
    experienceYears: 15,
    languages: ['English', 'Malayalam'],
    rating: 4.8,
    reviewCount: 94,
    consultationFee: 1100,
    about: 'Focused on joint rehabilitation and sports injury care.',
    specializations: ['Orthopedics'],
    education: ['MBBS - KMC Manipal', 'MS Orthopedics - CMC Vellore'],
    availableDays: ['Tue', 'Wed', 'Fri', 'Sat'],
    availableSlots: ['10:00 AM', '12:30 PM', '04:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'RaviNair',
    userId: 'doctor-ravi',
    isCustomRegistered: true,
    consultationMode: 'In-Person',
    hospitalOrClinic: 'WeCare Orthopedic Center',
    verifiedByAdmin: true
  }
];

const seedAppointments = [
  {
    id: 'apt-demo-1',
    referenceNumber: 'WC-1001',
    departmentId: 'cardiology',
    departmentName: 'Cardiology',
    doctorId: 'doc-1',
    doctorName: 'Dr. Aisha Patel',
    doctorTitle: 'Consultant Cardiology',
    appointmentType: 'Video / Telehealth',
    date: '2026-10-15',
    timeSlot: '09:00 AM',
    patientName: 'Jon Smith',
    patientEmail: 'jon@example.com',
    patientPhone: '9876543210',
    patientAge: '34',
    patientGender: 'Male',
    reasonForVisit: 'Heart checkup',
    isFirstVisit: true,
    status: 'Confirmed',
    consultationMode: 'Video / Telehealth',
    createdAt: new Date().toISOString(),
    patientUid: 'patient-1',
    doctorUid: 'doctor-aisha',
    notes: 'Follow-up review'
  }
];

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT,
    displayName TEXT,
    role TEXT,
    doctorId TEXT,
    verificationStatus TEXT,
    photoURL TEXT,
    createdAt TEXT,
    isBlocked INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS doctor_applications (
    id TEXT PRIMARY KEY,
    userId TEXT,
    email TEXT,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all();
const hasPhoneColumn = userColumns.some((column) => column.name === 'phone');
if (!hasPhoneColumn) {
  db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
}
const hasBlockedColumn = userColumns.some((column) => column.name === 'isBlocked');
if (!hasBlockedColumn) {
  db.exec('ALTER TABLE users ADD COLUMN isBlocked INTEGER NOT NULL DEFAULT 0');
}

const doctorApplications = db.prepare('SELECT userId, data FROM doctor_applications').all();
const toVerifiedDoctor = (application) => ({
  id: application.id,
  name: application.fullName.startsWith('Dr.') ? application.fullName : `Dr. ${application.fullName}`,
  title: application.specialization,
  departmentId: application.departmentId,
  departmentName: application.departmentName,
  qualifications: application.qualifications,
  experienceYears: application.yearsOfExperience,
  languages: application.languagesSpoken || ['English'],
  rating: 0,
  reviewCount: 0,
  consultationFee: application.consultationFee,
  about: application.biography,
  specializations: [application.specialization],
  education: [`${application.university} (${application.graduationYear})`],
  availableDays: application.availableDays || [],
  availableSlots: application.availableHours ? [application.availableHours] : [],
  isAvailableToday: false,
  avatarSeed: application.fullName.replace(/\s+/g, ''),
  userId: application.userId,
  isCustomRegistered: true,
  consultationMode: application.consultationMode,
  hospitalOrClinic: application.hospitalOrClinic,
  verifiedByAdmin: true,
  locationName: application.hospitalOrClinic,
  city: application.clinicCity || '',
  clinicAddress: application.clinicAddress || '',
  latitude: application.latitude,
  longitude: application.longitude
});

for (const row of doctorApplications) {
  const application = JSON.parse(row.data);
  if (application.status === 'approved') {
    db.prepare("UPDATE users SET role = 'doctor', verificationStatus = 'approved' WHERE id = ?").run(row.userId);
    const doctor = toVerifiedDoctor(application);
    db.prepare('INSERT INTO doctors (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data')
      .run(doctor.id, JSON.stringify(doctor));
  }
}

const otpStore = new Map();

const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);
const validatePassword = (value) => {
  const password = String(value || '');
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};
const toE164Phone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
};
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const sendOtpSms = async (phone, otp) => {
  if (!twilioClient || !TWILIO_SENDER_NUMBER) {
    console.log(`[OTP DEMO] SMS not sent to ${phone}. OTP: ${otp}`);
    return false;
  }

  const to = toE164Phone(phone);
  if (!to) {
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: `Your WeCare OTP is ${otp}. Valid for 5 minutes.`,
      from: TWILIO_SENDER_NUMBER,
      to,
    });
    return true;
  } catch (error) {
    console.error('Twilio SMS send failed:', error?.message || error);
    return false;
  }
};

const makeUserPayload = (row) => ({
  uid: row.id,
  email: row.email,
  phone: row.phone,
  displayName: row.displayName,
  role: row.role || 'patient',
  photoURL: row.photoURL || '',
  doctorId: row.doctorId || undefined,
  verificationStatus: row.verificationStatus || undefined,
  isBlocked: Boolean(row.isBlocked),
  createdAt: row.createdAt
});

const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get()?.count || 0;
const adminExists = db.prepare('SELECT 1 FROM users WHERE email = ?').get('shashidharswamy2004@gmail.com');
if (usersCount === 0) {
  db.prepare(`INSERT INTO users (id, email, phone, password, displayName, role, doctorId, verificationStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'patient-demo',
    'patient@wecare.local',
    '9876543210',
    'demo123',
    'Demo Patient',
    'patient',
    null,
    null,
    new Date().toISOString()
  );
}

if (!adminExists) {
  db.prepare(`INSERT INTO users (id, email, phone, password, displayName, role, doctorId, verificationStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'admin-shashidharswamy',
    'shashidharswamy2004@gmail.com',
    '9999999999',
    'admin123',
    'Hospital Admin',
    'admin',
    null,
    null,
    new Date().toISOString()
  );
}

for (const doctor of seedDoctors) {
  db.prepare('INSERT INTO doctors (id, data) VALUES (?, ?) ON CONFLICT(id) DO NOTHING')
    .run(doctor.id, JSON.stringify(doctor));
}

const appointmentsCount = db.prepare('SELECT COUNT(*) AS count FROM appointments').get()?.count || 0;
if (appointmentsCount === 0) {
  for (const appointment of seedAppointments) {
    db.prepare('INSERT INTO appointments (id, data) VALUES (?, ?)').run(appointment.id, JSON.stringify(appointment));
  }
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'WeCare SQL API is running' });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, phone, password, name } = req.body || {};
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = String(email || `${normalizedPhone || 'guest'}@wecare.local`).trim().toLowerCase();

  if ((!normalizedEmail || normalizedEmail === '@wecare.local') && !normalizedPhone) {
    return res.status(400).json({ message: 'Email or phone number is required.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.' });
  }

  const existingByEmail = normalizedEmail ? db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) : null;
  const existingByPhone = normalizedPhone ? db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizedPhone) : null;

  if (existingByEmail) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  if (existingByPhone) {
    return res.status(409).json({ message: 'An account with this mobile number already exists.' });
  }

  const uid = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const createdAt = new Date().toISOString();
  const user = {
    uid,
    email: normalizedEmail,
    phone: normalizedPhone || null,
    displayName: name || normalizedEmail.split('@')[0],
    role: 'patient',
    photoURL: '',
    doctorId: null,
    verificationStatus: null,
    createdAt
  };

  db.prepare(`INSERT INTO users (id, email, phone, password, displayName, role, doctorId, verificationStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    uid,
    user.email,
    user.phone,
    String(password),
    user.displayName,
    user.role,
    null,
    null,
    createdAt
  );

  res.json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, phone, password } = req.body || {};
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if ((!normalizedEmail && !normalizedPhone) || !password) {
    return res.status(400).json({ message: 'Email or mobile number and password are required.' });
  }

  let userRow = null;

  if (normalizedEmail) {
    userRow = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(normalizedEmail, String(password));
  } else if (normalizedPhone) {
    userRow = db.prepare('SELECT * FROM users WHERE phone = ? AND password = ?').get(normalizedPhone, String(password));
  }

  if (!userRow) {
    return res.status(401).json({ message: 'Invalid email/mobile or password.' });
  }
  if (userRow.isBlocked) {
    return res.status(403).json({ message: 'This account is blocked. Contact hospital support.' });
  }

  res.json({ user: makeUserPayload(userRow) });
});

app.post('/api/auth/mobile/send-otp', async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) {
    return res.status(400).json({ message: 'Mobile number is required.' });
  }

  const otp = generateOtp();
  otpStore.set(phone, { otp, createdAt: Date.now() });

  const smsSent = await sendOtpSms(phone, otp);
  res.json({
    message: smsSent
      ? `OTP sent to ${phone}.`
      : `OTP sent to ${phone}. For demo purposes, use code ${otp}.`,
    otp,
    smsSent,
    provider: smsSent ? 'twilio' : 'demo'
  });
});

app.post('/api/auth/mobile/signup', (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const otp = String(req.body?.otp || '');
  const password = String(req.body?.password || '');
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!phone || !email || !otp || !password) {
    return res.status(400).json({ message: 'Mobile number, email address, OTP, and password are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'A valid email address is required for account updates.' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.' });
  }

  const entry = otpStore.get(phone);
  if (!entry || entry.otp !== otp || Date.now() - entry.createdAt > 5 * 60 * 1000) {
    return res.status(401).json({ message: 'Invalid or expired OTP.' });
  }

  const existingByEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingByEmail) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const existingByPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existingByPhone) {
    return res.status(409).json({ message: 'An account with this mobile number already exists.' });
  }

  const uid = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const createdAt = new Date().toISOString();
  const user = {
    uid,
    email,
    phone,
    displayName: name || email.split('@')[0],
    role: 'patient',
    photoURL: '',
    doctorId: null,
    verificationStatus: null,
    createdAt
  };

  db.prepare(`INSERT INTO users (id, email, phone, password, displayName, role, doctorId, verificationStatus, photoURL, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    uid,
    user.email,
    user.phone,
    password,
    user.displayName,
    user.role,
    null,
    null,
    user.photoURL,
    createdAt
  );

  otpStore.delete(phone);
  res.status(201).json({ user });
});

app.post('/api/auth/mobile/verify-otp', (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const otp = String(req.body?.otp || '');

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Mobile number and OTP are required.' });
  }

  const entry = otpStore.get(phone);
  if (!entry || entry.otp !== otp) {
    return res.status(401).json({ message: 'Invalid or expired OTP.' });
  }

  const userRow = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!userRow) {
    return res.status(404).json({ message: 'No account found for this mobile number.' });
  }
  if (userRow.isBlocked) {
    otpStore.delete(phone);
    return res.status(403).json({ message: 'This account is blocked. Contact hospital support.' });
  }

  otpStore.delete(phone);
  res.json({ user: makeUserPayload(userRow) });
});

app.post('/api/auth/mobile/login', (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const password = req.body?.password;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Mobile number and password are required.' });
  }

  const userRow = db.prepare('SELECT * FROM users WHERE phone = ? AND password = ?').get(phone, String(password));
  if (!userRow) {
    return res.status(401).json({ message: 'Invalid mobile number or password.' });
  }
  if (userRow.isBlocked) {
    return res.status(403).json({ message: 'This account is blocked. Contact hospital support.' });
  }

  res.json({ user: makeUserPayload(userRow) });
});

app.post('/api/auth/mobile/reset-password', (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const otp = String(req.body?.otp || '');
  const newPassword = String(req.body?.newPassword || '');

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ message: 'Mobile number, OTP, and a new password are required.' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.' });
  }

  const entry = otpStore.get(phone);
  if (!entry || entry.otp !== otp) {
    return res.status(401).json({ message: 'Invalid or expired OTP.' });
  }

  const userRow = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!userRow) {
    return res.status(404).json({ message: 'No account found for this mobile number.' });
  }

  db.prepare('UPDATE users SET password = ? WHERE phone = ?').run(newPassword, phone);
  otpStore.delete(phone);

  res.json({ message: 'Password updated successfully.' });
});

app.post('/api/auth/reset', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!userRow) {
    return res.status(404).json({ message: 'No account found for this email.' });
  }

  res.json({ message: `A password reset link would be sent to ${userRow.email}.` });
});

app.get('/api/users/:uid', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.uid);
  if (!row) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const user = {
    uid: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role || 'patient',
    photoURL: row.photoURL || '',
    doctorId: row.doctorId || undefined,
    verificationStatus: row.verificationStatus || undefined,
    isBlocked: Boolean(row.isBlocked),
    createdAt: row.createdAt
  };

  res.json({ user });
});

app.post('/api/doctor-applications', (req, res) => {
  const payload = req.body;
  const application = {
    ...payload,
    status: payload.status || 'pending',
    physicalVerificationOutstanding: payload.physicalVerificationOutstanding ?? true,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt || new Date().toISOString()
  };

  const existing = db.prepare('SELECT * FROM doctor_applications WHERE id = ?').get(application.id);
  if (existing) {
    db.prepare('UPDATE doctor_applications SET userId = ?, email = ?, data = ? WHERE id = ?').run(application.userId, application.email, JSON.stringify(application), application.id);
  } else {
    db.prepare('INSERT INTO doctor_applications (id, userId, email, data) VALUES (?, ?, ?, ?)').run(application.id, application.userId, application.email, JSON.stringify(application));
  }

  db.prepare(`INSERT INTO users (id, email, displayName, role, doctorId, verificationStatus, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET email=excluded.email, displayName=excluded.displayName, role=excluded.role, doctorId=excluded.doctorId, verificationStatus=excluded.verificationStatus`).run(
    application.userId,
    application.email,
    application.fullName,
    'patient',
    application.id,
    'pending',
    new Date().toISOString()
  );

  res.json({ application });
});

app.get('/api/doctor-applications', (req, res) => {
  const rows = db.prepare('SELECT * FROM doctor_applications ORDER BY rowid DESC').all();
  const applications = rows.map((row) => JSON.parse(row.data));
  res.json({ applications });
});

app.get('/api/doctor-applications/:userId', (req, res) => {
  const row = db.prepare('SELECT * FROM doctor_applications WHERE userId = ? OR id = ? ORDER BY rowid DESC LIMIT 1').get(req.params.userId, req.params.userId);
  if (!row) {
    return res.json({ application: null });
  }
  res.json({ application: JSON.parse(row.data) });
});

app.post('/api/doctor-applications/:id/review', (req, res) => {
  const { status, applicantFeedback, internalReviewNotes, reviewerEmail } = req.body || {};
  const row = db.prepare('SELECT * FROM doctor_applications WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: 'Application not found.' });
  }

  const app = JSON.parse(row.data);
  const updated = {
    ...app,
    status,
    applicantFeedback: applicantFeedback || '',
    internalReviewNotes: internalReviewNotes || '',
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail || 'admin',
    updatedAt: new Date().toISOString()
  };

  db.prepare('UPDATE doctor_applications SET data = ? WHERE id = ?').run(JSON.stringify(updated), req.params.id);
  db.prepare('UPDATE users SET role = ?, verificationStatus = ? WHERE id = ?').run(
    status === 'approved' ? 'doctor' : 'patient',
    status,
    app.userId
  );
  if (status === 'approved') {
    const doctor = toVerifiedDoctor(updated);
    db.prepare('INSERT INTO doctors (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data')
      .run(doctor.id, JSON.stringify(doctor));
  } else {
    db.prepare('DELETE FROM doctors WHERE id = ?').run(app.id);
  }
  res.json({ application: updated });
});

app.get('/api/doctors', (req, res) => {
  const rows = db.prepare('SELECT * FROM doctors ORDER BY rowid DESC').all();
  const doctors = rows.map((row) => JSON.parse(row.data));
  res.json({ doctors });
});

app.post('/api/doctors', (req, res) => {
  const doctor = req.body;
  const id = doctor.id || `doc-${Date.now()}`;
  db.prepare('INSERT INTO doctors (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(id, JSON.stringify({ ...doctor, id }));
  res.json({ doctor: { ...doctor, id } });
});

app.get('/api/appointments', (req, res) => {
  const doctorId = req.query.doctorId;
  const rows = db.prepare('SELECT * FROM appointments ORDER BY rowid DESC').all();
  const appointments = rows.map((r) => JSON.parse(r.data));
  const filtered = doctorId ? appointments.filter((a) => a.doctorId === doctorId || a.doctorUid === doctorId) : appointments;
  res.json({ appointments: filtered });
});

app.post('/api/appointments', (req, res) => {
  const appointment = { ...req.body, createdAt: req.body.createdAt || new Date().toISOString() };
  db.prepare('INSERT INTO appointments (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(appointment.id, JSON.stringify(appointment));
  res.json({ appointment });
});

app.put('/api/appointments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }

  const current = JSON.parse(row.data);
  const updated = { ...current, ...req.body, id: req.params.id };
  db.prepare('UPDATE appointments SET data = ? WHERE id = ?').run(JSON.stringify(updated), req.params.id);
  res.json({ appointment: updated });
});

app.patch('/api/admin/users/:uid/block', (req, res) => {
  const { isBlocked, adminUid } = req.body || {};
  if (typeof isBlocked !== 'boolean' || !adminUid) {
    return res.status(400).json({ message: 'A block status and administrator account are required.' });
  }

  const admin = db.prepare('SELECT role, email FROM users WHERE id = ?').get(String(adminUid));
  if (!admin || (admin.role !== 'admin' && String(admin.email || '').toLowerCase() !== 'shashidharswamy2004@gmail.com')) {
    return res.status(403).json({ message: 'Administrator access is required to block accounts.' });
  }

  const account = db.prepare('SELECT id, role, doctorId FROM users WHERE id = ?').get(req.params.uid);
  if (!account) {
    return res.status(404).json({ message: 'Account not found.' });
  }
  if (account.role === 'admin' || (account.role !== 'doctor' && account.role !== 'patient')) {
    return res.status(400).json({ message: 'Only patient and doctor accounts can be blocked.' });
  }

  db.prepare('UPDATE users SET isBlocked = ? WHERE id = ?').run(isBlocked ? 1 : 0, account.id);
  res.json({ uid: account.id, isBlocked });
});

app.get('/api/admin/dashboard', (req, res) => {
  const patients = db.prepare(`
    SELECT id AS uid, displayName, email, phone, createdAt, isBlocked
    FROM users
    WHERE role = 'patient' AND doctorId IS NULL
    ORDER BY rowid DESC
  `).all();
  const doctorAccounts = db.prepare(`
    SELECT id AS uid, displayName, email, phone, doctorId, verificationStatus, isBlocked
    FROM users
    WHERE role = 'doctor' OR doctorId IS NOT NULL
    ORDER BY rowid DESC
  `).all().map((account) => ({ ...account, isBlocked: Boolean(account.isBlocked) }));
  const doctors = db.prepare('SELECT data FROM doctors ORDER BY rowid DESC').all()
    .map((row) => JSON.parse(row.data));
  const appointments = db.prepare('SELECT data FROM appointments ORDER BY rowid DESC').all()
    .map((row) => JSON.parse(row.data));
  const supportTickets = db.prepare('SELECT data FROM support_tickets ORDER BY rowid DESC').all()
    .map((row) => {
      const ticket = JSON.parse(row.data);
      const { imageDataUrl, ...summary } = ticket;
      return summary;
    });

  res.json({ patients: patients.map((patient) => ({ ...patient, isBlocked: Boolean(patient.isBlocked) })), doctorAccounts, doctors, appointments, supportTickets });
});

app.get('/api/support-tickets/:id', (req, res) => {
  const row = db.prepare('SELECT data FROM support_tickets WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: 'Support ticket not found.' });
  }
  res.json({ ticket: JSON.parse(row.data) });
});

app.get('/api/support-tickets', (req, res) => {
  const userId = String(req.query.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ message: 'A user account is required to view support tickets.' });
  }

  const tickets = db.prepare("SELECT data FROM support_tickets WHERE json_extract(data, '$.userId') = ? ORDER BY rowid DESC")
    .all(userId)
    .map((row) => {
      const { id, category, status, createdAt, resolvedAt } = JSON.parse(row.data);
      return { id, category, status, createdAt, resolvedAt };
    });

  res.json({ tickets });
});

app.patch('/api/support-tickets/:id', (req, res) => {
  const status = req.body?.status;
  if (!['open', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Ticket status must be open or resolved.' });
  }

  const row = db.prepare('SELECT data FROM support_tickets WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ message: 'Support ticket not found.' });
  }

  const ticket = {
    ...JSON.parse(row.data),
    status,
    resolvedAt: status === 'resolved' ? new Date().toISOString() : null
  };
  db.prepare('UPDATE support_tickets SET data = ? WHERE id = ?').run(JSON.stringify(ticket), req.params.id);
  res.json({ ticket: { ...ticket, imageDataUrl: undefined } });
});

app.post('/api/support-tickets', (req, res) => {
  const { userId, userRole, userName, userEmail, category, message, imageDataUrl } = req.body || {};
  const allowedCategories = ['Appointment', 'Account', 'Website issue', 'Other'];
  const imagePattern = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
  const normalizedMessage = String(message || '').trim();

  if (!userId || !['patient', 'doctor'].includes(userRole)) {
    return res.status(400).json({ message: 'A signed-in patient or doctor account is required.' });
  }
  if (!allowedCategories.includes(category) || !normalizedMessage || normalizedMessage.length > 3000) {
    return res.status(400).json({ message: 'Choose an issue type and provide a problem description up to 3000 characters.' });
  }
  if (typeof imageDataUrl !== 'string' || imageDataUrl.length > 1_500_000 || !imagePattern.test(imageDataUrl)) {
    return res.status(400).json({ message: 'Attach a JPG, PNG, or WebP image no larger than 1 MB.' });
  }

  const id = `SUP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const ticket = {
    id,
    userId: String(userId),
    userRole,
    userName: String(userName || '').slice(0, 255),
    userEmail: String(userEmail || '').slice(0, 255),
    category,
    message: normalizedMessage,
    imageDataUrl,
    status: 'open',
    createdAt
  };

  db.prepare('INSERT INTO support_tickets (id, data) VALUES (?, ?)').run(id, JSON.stringify(ticket));
  res.status(201).json({ ticket: { id, status: ticket.status, createdAt } });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WeCare SQL API listening on http://localhost:${PORT}`);
});
