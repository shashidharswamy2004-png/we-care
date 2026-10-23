# WeCare Hospital

WeCare Hospital is a web-based hospital management and appointment booking project.

## Technologies
- React
- TypeScript
- Vite
- Node.js
- Express.js
- MySQL

## Features
- User authentication
- Doctor applications and verification
- Doctor listings
- Appointment booking
- Admin dashboard
- Support tickets

## Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Start the backend in a separate terminal:

```bash
npm run server
```

## Appointment notifications

Booking, confirmation, rescheduling, and cancellation create in-app notifications for the patient and doctor. The app shows unread notifications in the bell menu for signed-in users and refreshes them every 30 seconds. Appointment updates are also sent by SMS to the patient's booking number and the doctor's registered mobile number.

To deliver SMS, configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_SENDER_NUMBER` in the server environment. Twilio must be enabled for the destination numbers; when Twilio is not configured, the app notifications still work and the server logs that SMS was not sent.
