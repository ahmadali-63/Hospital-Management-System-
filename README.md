# Hospital Management System (HMS) MVP

## Project Overview
This project is a professional, production-structured Hospital Management System MVP. It provides a real working full-stack system focusing on three core roles: **Admin**, **Doctor**, and **Patient**. The system enforces strict Role-Based Access Control (RBAC) and data privacy across all modules.

## Features
- **User Authentication:** Secure JWT-based authentication with bcrypt password hashing.
- **Role-Based Authorization:** Strict access controls for Admin, Doctor, and Patient roles.
- **Patient Management:** Registration, profiles, and data privacy enforcement.
- **Doctor Management:** Profiles, specialization, working hours, and search functionality.
- **Appointments Engine:** Booking system with double-booking prevention and fee freezing.
- **Clinical Workflows:** Medical records, symptom tracking, diagnosis, and prescription management.
- **Hospital Resources:** Complete bed and ward management with admission/discharge logic.
- **Emergency Ward:** Priority-based emergency case registration and tracking.
- **Billing:** Automated billing compilation for consultations, beds, and emergencies.

## Tech Stack
### Frontend (Client)
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS & shadcn/ui
- React Hook Form & Zod
- TanStack Query (React Query)
- Recharts & Lucide React

### Backend (Server)
- Node.js & Express
- TypeScript
- MongoDB & Mongoose
- Zod Validation
- JWT & bcryptjs
- Pino Logging
- Security: Helmet, CORS, Rate Limiting

## Architecture
This project uses a clean **MVC + Service Layer** architecture within a Monorepo.

`Route → Auth Middleware → RBAC Middleware → Validation → Controller → Service → Mongoose Model → MongoDB`

## Project Structure
```text
hospital-management-system/
├── client/          (Next.js Frontend)
│   ├── src/app/
│   ├── src/components/
│   └── package.json
├── server/          (Express Backend)
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── config/
│   │   ├── scripts/
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
└── package.json     (Root Workspace)
```

## Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   A root `.env` file is already provided. You can configure:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/hms
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Database Seeding:**
   To populate the database with an Admin, Departments, Doctors, Wards, and Beds:
   ```bash
   npm run seed --workspace=server
   ```
   *Admin Credentials:* `admin@hms.com` / `admin123`
   *Doctor Credentials:* `john@hms.com` / `doctor123`

4. **Running the Application:**
   From the root directory:
   ```bash
   npm run dev
   ```
   This will start both the Next.js client on port 3000 and the Express server on port 5000.

## API Overview
- `POST /api/auth/register` - Patient Registration
- `POST /api/auth/login` - User Login
- `GET /api/doctors` - Search/List Doctors
- `POST /api/doctors` - Register Doctor (Admin)
- `POST /api/appointments` - Book Appointment
- `GET /api/appointments` - View Appointments
- `PATCH /api/appointments/:id/status` - Update Appointment Status
- `POST /api/clinical/records` - Add Medical Record (Doctor)
- `GET /api/clinical/records` - View Medical Records
- `POST /api/clinical/prescriptions` - Create Prescription (Doctor)
- `GET /api/clinical/prescriptions` - View Prescriptions
- `GET /api/beds` - View Hospital Beds Status
- `POST /api/beds/admissions` - Admit Patient (Admin)
- `PATCH /api/beds/admissions/:id/discharge` - Discharge Patient (Admin)
- `POST /api/emergency` - Register Emergency Case (Admin)
- `GET /api/emergency` - View Emergency Cases
- `POST /api/billing` - Generate Bill (Admin)
- `GET /api/billing` - View Bills
- `POST /api/billing/:id/pay` - Record Payment (Admin)
- `GET /api/stats` - Live Dashboard Statistics

## MVP Scope Constraints
The following features are explicitly **Future Enhancements (Phase 2)** and are not included in this MVP:
- Pharmacy & Medicine Inventory
- Laboratory & Blood Bank
- Online Payment Gateways
- Advanced Real-Time Infrastructure (WebSockets)
- Email/SMS Notifications
