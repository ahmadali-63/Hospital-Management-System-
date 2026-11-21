# Hospital Management System (HMS) MVP

## Project Overview

This project is a professional, production-structured Hospital Management System MVP. It provides a real working full-stack system focusing on role-based hospital workflows with strict Role-Based Access Control (RBAC), data privacy, and separate role portals for **Super Admin**, **Hospital Admin**, **Doctor**, **Staff**, and **Patient**.

---

## Key Features

- **Multi-Role Authentication & Onboarding:**
  - Role-based registration: Patient, Doctor, or Staff directly from `/auth/register`.
  - Unified secure login at `/auth/login` with automatic role-based redirection.
  - Automatic Super Admin seeding directly from `.env` configuration on server startup.
- **Dedicated Portals & Role-Based Navigation:**
  - **Patient Portal (`/dashboard/patient`):** View personal upcoming visits, cancel bookings, view issued prescriptions, track medical history, and inspect unpaid/paid invoices.
  - **Doctor Portal (`/dashboard/doctor`):** View assigned patient consultations, start/complete/cancel visits, inspect real-time emergency triage cases, and access clinical records.
  - **Super Admin Member Directory (`/dashboard/users`):** Complete overview of all registered members across roles (Patients, Doctors, Staff, Admins, Super Admins) with search, role filters, and active/disabled account toggles.
  - **Hospital Operations Overview (`/dashboard`):** Real-time operational metrics for beds, doctors, patients, and recent admissions.
- **Appointments Engine:** Booking engine with double-booking prevention, historical consultation fee freezing, and patient/doctor status tracking.
- **Clinical Workflows:** Medical records, symptom tracking, diagnosis, and prescription management.
- **Hospital Resources:** Complete bed and ward management with admission/discharge logic.
- **Emergency Ward:** Priority-based emergency case registration (Level 1–5 triage) and tracking.
- **Billing & Invoices:** Automated billing compilation for consultations, beds, and emergencies with payment recording.

---

## Tech Stack

### Frontend (Client)

- **Framework:** Next.js (App Router) & React
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide React
- **Data Visualization:** Recharts
- **HTTP Client:** Axios

### Backend (Server)

- **Runtime & Framework:** Node.js & Express
- **Language:** TypeScript
- **Database:** MongoDB & Mongoose
- **Validation:** Zod
- **Security:** JWT authentication, bcryptjs, Helmet, CORS, Rate Limiting
- **Logging:** Pino Logger

---

## Architecture

This project uses a clean **MVC + Service Layer** architecture within an npm monorepo:

`Route -> Auth Middleware -> RBAC Middleware -> Validation -> Controller -> Service -> Mongoose Model -> MongoDB`

```text
hospital-management-system/
├── client/                     (Next.js Frontend)
│   ├── src/app/
│   │   ├── auth/login/         (Unified Login with role-based routing)
│   │   ├── auth/register/      (Multi-role registration: Patient, Doctor, Staff)
│   │   ├── dashboard/
│   │   │   ├── patient/        (Patient-specific portal)
│   │   │   ├── doctor/         (Doctor-specific consultation portal)
│   │   │   ├── users/          (Super Admin member directory & audit)
│   │   │   ├── appointments/   (Appointment management)
│   │   │   ├── beds/           (Bed and ward management)
│   │   │   ├── billing/        (Hospital invoicing & billing)
│   │   │   ├── clinical/       (Medical records & prescriptions)
│   │   │   ├── doctors/        (Doctor directory)
│   │   │   ├── emergency/      (Emergency triage & admissions)
│   │   │   └── patients/       (Patient registry)
│   │   └── layout.tsx
│   ├── src/components/         (Role-adaptive Sidebar & UI components)
│   └── package.json
├── server/                     (Express Backend)
│   ├── src/
│   │   ├── config/             (Database connection & Super Admin auto-init)
│   │   ├── controllers/        (Request handling & status codes)
│   │   ├── middlewares/        (JWT authentication & role-based authorization)
│   │   ├── models/             (User, Patient, Doctor, Appointment, Bed, Clinical, Billing, Emergency)
│   │   ├── routes/             (REST endpoints)
│   │   ├── services/           (Business logic & transactions)
│   │   ├── validators/         (Zod schemas)
│   │   ├── app.ts              (Express configuration & route mounting)
│   │   └── server.ts           (Server bootstrap & DB connection)
│   └── package.json
├── .env                        (Root Environment Variables)
└── package.json                (Root Monorepo Workspace)
```

---

```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Demo Data (Optional)

To seed initial departments, doctors, wards, and beds:

```bash
npm run seed --workspace=server
```

### 3. Start Development Servers

From the root directory:

```bash
npm run dev
```

- Client runs on: `http://localhost:3000`
- API Server runs on: `http://localhost:5000`

---

## User Roles & Pre-configured Credentials

| Role | Email | Password | Access & Dashboard |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@hms.com` | `superadmin12345` | Full system access, all member controls (`/dashboard/users`, `/dashboard`) |
| **Hospital Admin** | `admin@hms.com` | `admin123` | Hospital operations, beds, emergency, appointments, billing (`/dashboard`) |
| **Doctor** | `john@hms.com` | `doctor123` | Consultation schedule, triage cases, clinical workflows (`/dashboard/doctor`) |
| **Staff** | *(Register via `/auth/register`)* | *(Chosen at sign up)* | Hospital operations, admissions, billing, patients (`/dashboard`) |
| **Patient** | *(Register via `/auth/register`)* | *(Chosen at sign up)* | Personal visits, prescriptions, medical records, invoices (`/dashboard/patient`) |

---

## Role-Based Redirection Flow

- When any user registers or logs in:
  - If role is **`PATIENT`** -> Automatically routed to `/dashboard/patient`.
  - If role is **`DOCTOR`** -> Automatically routed to `/dashboard/doctor`.
  - If role is **`SUPER_ADMIN`**, **`ADMIN`**, or **`STAFF`** -> Routed to `/dashboard`.
- If a patient or doctor directly navigates to `/dashboard`, the safeguard automatically forwards them to `/dashboard/patient` or `/dashboard/doctor`.
- The sidebar dynamically filters navigation items so each role sees only their relevant tools and pages.

---

## REST API Overview

- **Authentication & Members:**
  - `POST /api/auth/register` - Multi-role registration (Patient, Doctor, Staff)
  - `POST /api/auth/login` - User login & JWT issuance
  - `GET /api/users` - List all members with role counts (Super Admin / Admin)
  - `PATCH /api/users/:id/status` - Toggle user active/deactivated status
- **Appointments:**
  - `POST /api/appointments` - Book appointment
  - `GET /api/appointments` - Role-scoped appointment listings
  - `PATCH /api/appointments/:id/status` - Update status (Confirmed, In Progress, Completed, Cancelled)
- **Doctors & Patients:**
  - `GET /api/doctors` - Directory of doctors & departments
  - `GET /api/patients` - Patient records (Admin & Staff)
  - `GET /api/patients/:id` - Detailed patient profile
- **Clinical Workflows:**
  - `POST /api/clinical/records` - Add diagnosis / medical record
  - `GET /api/clinical/records` - List records
  - `POST /api/clinical/prescriptions` - Issue prescription with medication regimen
  - `GET /api/clinical/prescriptions` - List prescriptions
- **Bed & Ward Management:**
  - `GET /api/beds` - Bed status overview
  - `POST /api/beds/admissions` - Admit patient to bed
  - `PATCH /api/beds/admissions/:id/discharge` - Discharge patient
- **Emergency Ward:**
  - `POST /api/emergency` - Register emergency admission with triage level
  - `GET /api/emergency` - List active emergency cases
- **Billing:**
  - `POST /api/billing` - Generate bill
  - `GET /api/billing` - View invoices
  - `POST /api/billing/:id/pay` - Record payment
"# Hospital-Management-System-"
