import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import twilio from 'twilio';

const app = express();
const PORT = process.env.PORT || 4001;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SENDER_NUMBER = process.env.TWILIO_SENDER_NUMBER;
const hasTwilioCredentials = /^AC[a-f\d]{32}$/i.test(TWILIO_ACCOUNT_SID || '')
  && Boolean(TWILIO_AUTH_TOKEN && !TWILIO_AUTH_TOKEN.startsWith('YOUR_'));
const twilioClient = hasTwilioCredentials ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

const {
  MYSQL_HOST,
  MYSQL_PORT = '3306',
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE
} = process.env;

const hasMysqlConfig = Boolean(MYSQL_HOST && MYSQL_USER && MYSQL_PASSWORD && MYSQL_DATABASE);

let pool = null;

if (hasMysqlConfig) {
  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

function validatePassword(value) {
  const password = String(value || '');
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function toE164Phone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpSms(phone, otp) {
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
}

async function sendAppointmentSms(phone, message) {
  if (!twilioClient || !TWILIO_SENDER_NUMBER) {
    console.warn(`Appointment SMS not sent to ${phone || '(missing phone)'}; configure Twilio credentials and TWILIO_SENDER_NUMBER.`);
    return false;
  }

  const to = toE164Phone(phone);
  if (!to) {
    console.warn('Appointment SMS not sent because the recipient phone number is invalid.');
    return false;
  }

  try {
    await twilioClient.messages.create({ body: message, from: TWILIO_SENDER_NUMBER, to });
    return true;
  } catch (error) {
    console.error('Appointment notification SMS failed:', error?.message || error);
    return false;
  }
}

function getAppointmentEvent(type, appointment) {
  const appointmentTime = `${appointment.date} at ${appointment.timeSlot}`;
  const appointmentRef = appointment.referenceNumber || appointment.id;
  const doctorName = appointment.doctorName || 'your doctor';
  const patientName = appointment.patientName || 'A patient';
  const eventText = {
    booked: 'booked and confirmed',
    confirmed: 'confirmed',
    rescheduled: 'rescheduled',
    cancelled: 'cancelled'
  }[type];

  return {
    type,
    title: {
      booked: 'Appointment booked and confirmed',
      confirmed: 'Appointment confirmed',
      rescheduled: 'Appointment rescheduled',
      cancelled: 'Appointment cancelled'
    }[type],
    patientMessage: `Your appointment with ${doctorName} has been ${eventText} for ${appointmentTime}. Reference: ${appointmentRef}.`,
    doctorMessage: `${patientName}'s appointment has been ${eventText} for ${appointmentTime}. Reference: ${appointmentRef}.`,
    patientSms: `WeCare: Your appointment with ${doctorName} has been ${eventText} for ${appointmentTime}. Ref: ${appointmentRef}.`,
    doctorSms: `WeCare: ${patientName}'s appointment has been ${eventText} for ${appointmentTime}. Ref: ${appointmentRef}.`
  };
}

async function notifyAppointmentChange(appointment, type) {
  const event = getAppointmentEvent(type, appointment);
  const doctorUid = appointment.doctorUid || '';
  let doctorRows;
  if (doctorUid) {
    [doctorRows] = await pool.query('SELECT id, phone FROM users WHERE id = ?', [doctorUid]);
  } else {
    [doctorRows] = await pool.query('SELECT id, phone FROM users WHERE doctorId = ?', [appointment.doctorId]);
  }
  let doctorUser = doctorRows[0] || null;
  if (!doctorUser && appointment.doctorId) {
    const [fallbackDoctorRows] = await pool.query('SELECT id, phone FROM users WHERE doctorId = ?', [appointment.doctorId]);
    doctorUser = fallbackDoctorRows[0] || null;
  }
  let doctorPhone = doctorUser?.phone || '';

  if (!doctorPhone && doctorUid) {
    const [applicationRows] = await pool.query(
      'SELECT data FROM doctor_applications WHERE userId = ? OR id = ? ORDER BY id DESC LIMIT 1',
      [doctorUid, doctorUid]
    );
    if (applicationRows.length) {
      const application = typeof applicationRows[0].data === 'string'
        ? JSON.parse(applicationRows[0].data)
        : applicationRows[0].data;
      doctorPhone = application.phone || '';
    }
  }

  let patientUser = null;
  if (appointment.patientUid) {
    const [patientRows] = await pool.query('SELECT id FROM users WHERE id = ?', [appointment.patientUid]);
    patientUser = patientRows[0] || null;
  }
  if (!patientUser) {
    const normalizedPatientPhone = normalizePhone(appointment.patientPhone);
    const normalizedPatientEmail = String(appointment.patientEmail || '').trim().toLowerCase();
    const [patientRows] = await pool.query(
      'SELECT id, phone, email FROM users WHERE email = ? OR phone = ?',
      [normalizedPatientEmail, normalizedPatientPhone]
    );
    patientUser = patientRows.find((candidate) =>
      (normalizedPatientPhone && normalizePhone(candidate.phone) === normalizedPatientPhone)
      || (normalizedPatientEmail && String(candidate.email || '').toLowerCase() === normalizedPatientEmail)
    ) || null;
  }

  const recipients = [
    patientUser?.id && { userId: patientUser.id, message: event.patientMessage },
    doctorUser?.id && { userId: doctorUser.id, message: event.doctorMessage }
  ].filter(Boolean);
  const createdAt = new Date().toISOString();
  for (const recipient of recipients) {
    await pool.query(
      'INSERT INTO notifications (id, userId, type, title, message, appointmentId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, recipient.userId, event.type, event.title, recipient.message, appointment.id, createdAt]
    );
  }

  const smsRecipients = [
    { phone: appointment.patientPhone, message: event.patientSms },
    { phone: doctorPhone, message: event.doctorSms }
  ].filter((recipient) => recipient.phone);
  if (!doctorPhone) {
    console.warn(`Doctor appointment SMS not sent for ${appointment.id}; no registered doctor phone is available.`);
  }
  await Promise.all(smsRecipients.map((recipient) => sendAppointmentSms(recipient.phone, recipient.message)));
}

const otpStore = new Map();

function makeUserPayload(row) {
  return {
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
  };
}

async function ensureMysqlSchema() {
  if (!pool) return;

  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        password VARCHAR(255),
        displayName VARCHAR(255),
        role VARCHAR(50),
        doctorId VARCHAR(255),
        verificationStatus VARCHAR(50),
        photoURL VARCHAR(255),
        createdAt VARCHAR(255),
        isBlocked TINYINT(1) NOT NULL DEFAULT 0
      )
    `);

    const [blockedColumns] = await conn.query("SHOW COLUMNS FROM users LIKE 'isBlocked'");
    if (!blockedColumns.length) {
      await conn.query('ALTER TABLE users ADD COLUMN isBlocked TINYINT(1) NOT NULL DEFAULT 0');
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS doctor_applications (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        email VARCHAR(255),
        data JSON
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(255) PRIMARY KEY,
        data JSON
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(255) PRIMARY KEY,
        data JSON
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        appointmentId VARCHAR(255) NOT NULL,
        createdAt VARCHAR(255) NOT NULL,
        isRead TINYINT(1) NOT NULL DEFAULT 0,
        INDEX notifications_user_created (userId, createdAt)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(255) PRIMARY KEY,
        data JSON
      )
    `);

    const [doctorApplications] = await conn.query('SELECT userId, data FROM doctor_applications');
    for (const row of doctorApplications) {
      const application = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      if (application.status === 'approved') {
        await conn.query("UPDATE users SET role = 'doctor', verificationStatus = 'approved' WHERE id = ?", [row.userId]);
      }
    }

    const [rows] = await conn.query('SELECT COUNT(*) AS count FROM users');
    if (rows[0].count === 0) {
      await conn.query(
        'INSERT INTO users (id, email, password, displayName, role, doctorId, verificationStatus, photoURL, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['patient-demo', 'patient@wecare.local', 'demo123', 'Demo Patient', 'patient', null, null, '', new Date().toISOString()]
      );
    }
  } finally {
    conn.release();
  }
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  if (!hasMysqlConfig) {
    return res.status(503).json({
      ok: false,
      message: 'MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE in your environment.'
    });
  }

  res.json({ ok: true, message: 'WeCare MySQL API is running' });
});

app.post('/api/auth/signup', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

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

  const [existingRows] = await pool.query('SELECT * FROM users WHERE email = ? OR phone = ?', [normalizedEmail, normalizedPhone || null]);
  if (existingRows.length) {
    return res.status(409).json({ message: 'An account with this email or mobile number already exists.' });
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

  await pool.query(
    'INSERT INTO users (id, email, phone, password, displayName, role, doctorId, verificationStatus, photoURL, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [user.uid, user.email, user.phone, String(password), user.displayName, user.role, null, null, '', createdAt]
  );

  res.json({ user });
});

app.post('/api/auth/login', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const { email, phone, password } = req.body || {};
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if ((!normalizedEmail && !normalizedPhone) || !password) {
    return res.status(400).json({ message: 'Email or mobile number and password are required.' });
  }

  let [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [normalizedEmail, String(password)]);
  if (!rows.length && normalizedPhone) {
    [rows] = await pool.query('SELECT * FROM users WHERE phone = ? AND password = ?', [normalizedPhone, String(password)]);
  }

  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid email/mobile or password.' });
  }
  if (rows[0].isBlocked) {
    return res.status(403).json({ message: 'This account is blocked. Contact hospital support.' });
  }

  res.json({ user: makeUserPayload(rows[0]) });
});

app.post('/api/auth/mobile/send-otp', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

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

app.post('/api/auth/mobile/signup', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

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

  const [existingRows] = await pool.query('SELECT id, email, phone FROM users WHERE email = ? OR phone = ? LIMIT 1', [email, phone]);
  if (existingRows.length) {
    return res.status(409).json({
      message: existingRows[0].phone === phone
        ? 'An account with this mobile number already exists.'
        : 'An account with this email already exists.'
    });
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

  await pool.query(
    'INSERT INTO users (id, email, phone, password, displayName, role, doctorId, verificationStatus, photoURL, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [uid, user.email, user.phone, password, user.displayName, user.role, null, null, '', createdAt]
  );

  otpStore.delete(phone);
  res.status(201).json({ user });
});

app.post('/api/auth/mobile/verify-otp', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const phone = normalizePhone(req.body?.phone);
  const otp = String(req.body?.otp || '');
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Mobile number and OTP are required.' });
  }

  const entry = otpStore.get(phone);
  if (!entry || entry.otp !== otp) {
    return res.status(401).json({ message: 'Invalid or expired OTP.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
  if (!rows.length) {
    return res.status(404).json({ message: 'No account found for this mobile number.' });
  }
  if (rows[0].isBlocked) {
    otpStore.delete(phone);
    return res.status(403).json({ message: 'This account is blocked. Contact hospital support.' });
  }

  otpStore.delete(phone);
  res.json({ user: makeUserPayload(rows[0]) });
});

app.post('/api/auth/mobile/login', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const phone = normalizePhone(req.body?.phone);
  const password = req.body?.password;
  if (!phone || !password) {
    return res.status(400).json({ message: 'Mobile number and password are required.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, String(password)]);
  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid mobile number or password.' });
  }
  if (rows[0].isBlocked) {
    return res.status(403).json({ message: 'This account is blocked. Contact hospital support.' });
  }

  res.json({ user: makeUserPayload(rows[0]) });
});

app.post('/api/auth/mobile/reset-password', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

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

  const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
  if (!rows.length) {
    return res.status(404).json({ message: 'No account found for this mobile number.' });
  }

  await pool.query('UPDATE users SET password = ? WHERE phone = ?', [newPassword, phone]);
  otpStore.delete(phone);

  res.json({ message: 'Password updated successfully.' });
});

app.post('/api/auth/reset', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
  if (!rows.length) {
    return res.status(404).json({ message: 'No account found for this email.' });
  }

  res.json({ message: `A password reset link would be sent to ${rows[0].email}.` });
});

app.get('/api/doctors', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const [rows] = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
  const doctors = rows.map((row) => JSON.parse(row.data));
  res.json({ doctors });
});

app.post('/api/doctors', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const doctor = { ...req.body, id: req.body.id || `doc-${Date.now()}` };
  await pool.query('INSERT INTO doctors (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)', [doctor.id, JSON.stringify(doctor)]);
  res.json({ doctor });
});

app.get('/api/appointments', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const [rows] = await pool.query('SELECT * FROM appointments ORDER BY id ASC');
  const appointments = rows.map((row) => JSON.parse(row.data));
  res.json({ appointments });
});

app.post('/api/appointments', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const appointment = { ...req.body, createdAt: req.body.createdAt || new Date().toISOString() };
  const [existingRows] = await pool.query('SELECT id FROM appointments WHERE id = ?', [appointment.id]);
  await pool.query('INSERT INTO appointments (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)', [appointment.id, JSON.stringify(appointment)]);
  if (!existingRows.length) {
    await notifyAppointmentChange(appointment, 'booked');
  }
  res.json({ appointment });
});

app.put('/api/appointments/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const [rows] = await pool.query('SELECT data FROM appointments WHERE id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }

  const current = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
  const updated = { ...current, ...req.body, id: req.params.id };
  await pool.query('UPDATE appointments SET data = ? WHERE id = ?', [JSON.stringify(updated), req.params.id]);

  let eventType = null;
  if (updated.status === 'Cancelled' && current.status !== 'Cancelled') {
    eventType = 'cancelled';
  } else if (updated.date !== current.date || updated.timeSlot !== current.timeSlot) {
    eventType = 'rescheduled';
  } else if (updated.status === 'Confirmed' && current.status !== 'Confirmed') {
    eventType = 'confirmed';
  }
  if (eventType) {
    await notifyAppointmentChange(updated, eventType);
  }
  res.json({ appointment: updated });
});

app.get('/api/notifications', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const userId = String(req.query.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ message: 'A user ID is required.' });
  }

  const [rows] = await pool.query(
    'SELECT id, userId, type, title, message, appointmentId, createdAt, isRead FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
    [userId]
  );
  res.json({ notifications: rows.map((notification) => ({ ...notification, isRead: Boolean(notification.isRead) })) });
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const userId = String(req.body?.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ message: 'A user ID is required.' });
  }

  const [result] = await pool.query(
    'UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?',
    [req.params.id, userId]
  );
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Notification not found.' });
  }
  res.json({ id: req.params.id, isRead: true });
});

app.post('/api/support-tickets', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

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

  await pool.query('INSERT INTO support_tickets (id, data) VALUES (?, ?)', [id, JSON.stringify(ticket)]);
  res.status(201).json({ ticket: { id, status: ticket.status, createdAt } });
});

app.patch('/api/admin/users/:uid/block', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const { isBlocked, adminUid } = req.body || {};
  if (typeof isBlocked !== 'boolean' || !adminUid) {
    return res.status(400).json({ message: 'A block status and administrator account are required.' });
  }

  const [adminRows] = await pool.query('SELECT role, email FROM users WHERE id = ?', [String(adminUid)]);
  const admin = adminRows[0];
  if (!admin || (admin.role !== 'admin' && String(admin.email || '').toLowerCase() !== 'shashidharswamy2004@gmail.com')) {
    return res.status(403).json({ message: 'Administrator access is required to block accounts.' });
  }

  const [accountRows] = await pool.query('SELECT id, role, doctorId FROM users WHERE id = ?', [req.params.uid]);
  const account = accountRows[0];
  if (!account) {
    return res.status(404).json({ message: 'Account not found.' });
  }
  if (account.role === 'admin' || (account.role !== 'doctor' && account.role !== 'patient')) {
    return res.status(400).json({ message: 'Only patient and doctor accounts can be blocked.' });
  }

  await pool.query('UPDATE users SET isBlocked = ? WHERE id = ?', [isBlocked ? 1 : 0, account.id]);
  res.json({ uid: account.id, isBlocked });
});

app.get('/api/admin/dashboard', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const [patients] = await pool.query(`
    SELECT id AS uid, displayName, email, phone, createdAt, isBlocked
    FROM users
    WHERE role = 'patient' AND doctorId IS NULL
    ORDER BY createdAt DESC
  `);
  const [doctorAccounts] = await pool.query(`
    SELECT id AS uid, displayName, email, phone, doctorId, verificationStatus, isBlocked
    FROM users
    WHERE role = 'doctor' OR doctorId IS NOT NULL
    ORDER BY createdAt DESC
  `);
  const [doctorRows] = await pool.query('SELECT data FROM doctors ORDER BY id DESC');
  const [appointmentRows] = await pool.query('SELECT data FROM appointments ORDER BY id DESC');
  const [ticketRows] = await pool.query('SELECT data FROM support_tickets ORDER BY id DESC');
  const supportTickets = ticketRows.map((row) => {
    const ticket = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    const { imageDataUrl, ...summary } = ticket;
    return summary;
  });

  res.json({
    patients: patients.map((patient) => ({ ...patient, isBlocked: Boolean(patient.isBlocked) })),
    doctorAccounts: doctorAccounts.map((account) => ({ ...account, isBlocked: Boolean(account.isBlocked) })),
    doctors: doctorRows.map((row) => typeof row.data === 'string' ? JSON.parse(row.data) : row.data),
    appointments: appointmentRows.map((row) => typeof row.data === 'string' ? JSON.parse(row.data) : row.data),
    supportTickets
  });
});

app.get('/api/support-tickets/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const [rows] = await pool.query('SELECT data FROM support_tickets WHERE id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).json({ message: 'Support ticket not found.' });
  }
  const ticket = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
  res.json({ ticket });
});

app.patch('/api/support-tickets/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const status = req.body?.status;
  if (!['open', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Ticket status must be open or resolved.' });
  }

  const [rows] = await pool.query('SELECT data FROM support_tickets WHERE id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).json({ message: 'Support ticket not found.' });
  }
  const current = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
  const ticket = {
    ...current,
    status,
    resolvedAt: status === 'resolved' ? new Date().toISOString() : null
  };
  await pool.query('UPDATE support_tickets SET data = ? WHERE id = ?', [JSON.stringify(ticket), req.params.id]);
  const { imageDataUrl, ...summary } = ticket;
  res.json({ ticket: summary });
});

app.get('/api/users/:uid', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'MySQL is not configured.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.uid]);
  if (!rows.length) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({ user: makeUserPayload(rows[0]) });
});

if (hasMysqlConfig) {
  await ensureMysqlSchema();
  app.listen(PORT, () => {
    console.log(`WeCare MySQL API listening on http://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`MySQL is not configured. Set MYSQL_* values and run: npm run server:mysql\nServer is ready for configuration on http://localhost:${PORT}`);
  });
}
