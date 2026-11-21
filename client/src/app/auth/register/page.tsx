'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  User,
  Stethoscope,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/services/api';

type RegistrationRole = 'PATIENT' | 'DOCTOR' | 'STAFF' | 'SUPER_ADMIN';

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  // Patient fields
  dateOfBirth: '',
  gender: 'Other',
  bloodGroup: 'O+',
  address: '',
  emergencyContact: '',
  // Doctor fields
  specialization: 'General Medicine',
  department: 'General Medicine',
  licenseNumber: '',
  consultationFee: '50',
  // Staff fields
  designation: 'Staff Nurse',
};

const departments = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Emergency',
  'Surgery',
  'Oncology',
  'Dermatology',
  'Radiology',
  'Administration',
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<RegistrationRole>('PATIENT');
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync role with query param ?role=doctor etc.
  useEffect(() => {
    const qRole = searchParams.get('role')?.toUpperCase();
    if (qRole === 'DOCTOR') setRole('DOCTOR');
    else if (qRole === 'STAFF') setRole('STAFF');
    else if (qRole === 'PATIENT') setRole('PATIENT');
    else if (qRole === 'SUPER_ADMIN') setRole('SUPER_ADMIN');
  }, [searchParams]);

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20';
  const selectClass = `${inputClass} [color-scheme:dark] [&>option]:bg-slate-900 [&>option]:text-white`;

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleShowPassword() {
    setShowPassword((prev) => !prev);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setMessage('Enter a valid email address.');
    if (form.password.length < 6) return setMessage('Password must be at least 6 characters.');
    if (form.phone.trim().length < 10) return setMessage('Phone number must contain at least 10 characters.');

    let payload: Record<string, unknown> = {
      role,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
    };

    if (role === 'PATIENT') {
      if (!form.dateOfBirth) return setMessage('Please select your date of birth.');
      if (!form.address.trim()) return setMessage('Please enter your address.');
      if (form.emergencyContact.trim().length < 10) {
        return setMessage('Emergency contact phone number must contain at least 10 characters.');
      }
      payload = {
        ...payload,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: form.address.trim(),
        emergencyContact: form.emergencyContact.trim(),
      };
    } else if (role === 'DOCTOR') {
      if (!form.licenseNumber.trim()) return setMessage('Please enter your medical license number.');
      if (!form.specialization.trim()) return setMessage('Please specify your specialization.');
      payload = {
        ...payload,
        specialization: form.specialization.trim(),
        department: form.department,
        licenseNumber: form.licenseNumber.trim(),
        consultationFee: Number(form.consultationFee) || 50,
      };
    } else if (role === 'STAFF') {
      if (!form.designation.trim()) return setMessage('Please enter your staff designation.');
      payload = {
        ...payload,
        department: form.department,
        designation: form.designation.trim(),
      };
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', payload);
      const user = response.data?.data?.user;
      const token = response.data?.data?.token;

      if (!token || !user) {
        throw new Error('Registration failed.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'PATIENT') {
        router.push('/dashboard/patient');
      } else if (user.role === 'DOCTOR') {
        router.push('/dashboard/doctor');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      const resp = (error as AxiosError<{ message?: string; errors?: Array<{ message?: string }> }>).response;
      const validationError = resp?.data?.errors?.[0]?.message;
      setMessage(validationError || resp?.data?.message || 'Registration failed. Check that the API and MongoDB are running.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="neon-page neon-grid relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-white">
      {/* Background orbs with pointer-events-none */}
      <div className="neon-orb absolute -left-24 top-12 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="neon-orb absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />

      <section className="neon-rise relative w-full max-w-3xl rounded-3xl border border-white/20 bg-white/[0.08] p-7 shadow-[0_0_70px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-10 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-cyan-300">
          <HeartPulse size={20} /> NEXUS CARE
        </Link>
        <div className="mt-8">
          <p className="text-sm font-medium text-fuchsia-300">Registration & Onboarding</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Create your account.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Select your role to get access to your personalized portal.
          </p>
        </div>

        {/* Role Selector Tabs (Patient, Doctor, Staff, Super Admin) */}
        <div className="mt-6 flex flex-wrap rounded-2xl bg-white/[0.05] p-1.5 border border-white/10 gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setRole('PATIENT');
              setMessage('');
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition cursor-pointer select-none ${
              role === 'PATIENT'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <User size={16} /> Patient
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setRole('DOCTOR');
              setMessage('');
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition cursor-pointer select-none ${
              role === 'DOCTOR'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Stethoscope size={16} /> Doctor
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setRole('STAFF');
              setMessage('');
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition cursor-pointer select-none ${
              role === 'STAFF'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Briefcase size={16} /> Staff
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setRole('SUPER_ADMIN');
              setMessage('');
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition cursor-pointer select-none ${
              role === 'SUPER_ADMIN'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-400/10'
            }`}
          >
            <ShieldCheck size={16} /> Super Admin
          </button>
        </div>

        {/* Super Admin Notice Card when Super Admin tab is selected */}
        {role === 'SUPER_ADMIN' ? (
          <div className="mt-8 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-7 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/40">
              👑 Root System Authority
            </div>
            <h2 className="text-2xl font-bold text-white">Super Admin Access</h2>
            <p className="text-sm leading-6 text-slate-300 max-w-lg mx-auto">
              The Super Admin account has master oversight to view <strong>everybody&apos;s data and information</strong> (all hospital members, patients, doctors, staff, records, and billing).
              Super Admin credentials are configured in your <code className="text-amber-300 font-mono font-bold">.env</code> file (<span className="text-amber-200 font-semibold">superadmin@hms.com</span>).
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/login?quick=superadmin"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-950 hover:bg-amber-300 transition shadow-lg shadow-amber-400/20"
              >
                Log in as Super Admin <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={() => setRole('DOCTOR')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Register as Doctor instead
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form for Patient, Doctor, Staff */
          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            {/* Common Fields */}
            <label className="text-sm font-medium text-slate-300">
              Full name
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className={inputClass}
                placeholder={role === 'DOCTOR' ? 'Dr. John Doe' : 'Enter full name'}
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-300">
              Email address
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className={inputClass}
                placeholder={role === 'DOCTOR' ? 'doctor@hospital.com' : 'name@example.com'}
                required
              />
            </label>

            {/* Password with Dual Toggle & Preview */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300" htmlFor="reg-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer select-none"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>
              <div className="relative mt-2">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 pr-12 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={toggleShowPassword}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-30 cursor-pointer rounded-lg p-2 transition select-none ${
                    showPassword
                      ? 'text-cyan-300 bg-cyan-400/20 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-white/[0.1]'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} className="pointer-events-none" /> : <Eye size={20} className="pointer-events-none" />}
                </button>
              </div>

              {/* Plain-text display when password visibility is active */}
              {showPassword && form.password && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs text-cyan-200">
                  <span className="font-semibold text-cyan-400">Password preview:</span>
                  <span className="font-mono select-all text-white font-bold">{form.password}</span>
                </div>
              )}
            </div>

            <label className="text-sm font-medium text-slate-300">
              Phone number
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className={inputClass}
                placeholder="+1 (555) 000-0000"
                required
              />
            </label>

            {/* Role: PATIENT specific fields */}
            {role === 'PATIENT' && (
              <>
                <label className="text-sm font-medium text-slate-300">
                  Date of birth
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) => updateField('dateOfBirth', event.target.value)}
                    className={inputClass}
                    required
                  />
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Gender
                  <select
                    value={form.gender}
                    onChange={(event) => updateField('gender', event.target.value)}
                    className={selectClass}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Blood group
                  <select
                    value={form.bloodGroup}
                    onChange={(event) => updateField('bloodGroup', event.target.value)}
                    className={selectClass}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                      <option key={group}>{group}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Emergency contact
                  <input
                    value={form.emergencyContact}
                    onChange={(event) => updateField('emergencyContact', event.target.value)}
                    className={inputClass}
                    placeholder="Emergency phone or contact"
                    required
                  />
                </label>
                <label className="text-sm font-medium text-slate-300 sm:col-span-2">
                  Residential address
                  <textarea
                    value={form.address}
                    onChange={(event) => updateField('address', event.target.value)}
                    className={`${inputClass} min-h-20 resize-y`}
                    placeholder="Street, City, Postal Code"
                    required
                  />
                </label>
              </>
            )}

            {/* Role: DOCTOR specific fields */}
            {role === 'DOCTOR' && (
              <>
                <div className="sm:col-span-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 p-3 text-xs text-cyan-200">
                  🩺 <strong>Doctor Onboarding:</strong> Fill in your clinical specialization and medical license to create your practitioner profile.
                </div>
                <label className="text-sm font-medium text-slate-300">
                  Department
                  <select
                    value={form.department}
                    onChange={(event) => updateField('department', event.target.value)}
                    className={selectClass}
                  >
                    {departments.map((dept) => (
                      <option key={dept}>{dept}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Specialization
                  <input
                    value={form.specialization}
                    onChange={(event) => updateField('specialization', event.target.value)}
                    className={inputClass}
                    placeholder="e.g. Cardiologist, Neurologist, General Medicine"
                    required
                  />
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Medical License Number
                  <input
                    value={form.licenseNumber}
                    onChange={(event) => updateField('licenseNumber', event.target.value)}
                    className={inputClass}
                    placeholder="e.g. MD-123456"
                    required
                  />
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Consultation Fee ($)
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={form.consultationFee}
                    onChange={(event) => updateField('consultationFee', event.target.value)}
                    className={inputClass}
                    placeholder="50"
                    required
                  />
                </label>
              </>
            )}

            {/* Role: STAFF specific fields */}
            {role === 'STAFF' && (
              <>
                <div className="sm:col-span-2 rounded-xl bg-purple-400/10 border border-purple-400/20 p-3 text-xs text-purple-200">
                  💼 <strong>Staff Onboarding:</strong> Select your hospital department and operational designation.
                </div>
                <label className="text-sm font-medium text-slate-300">
                  Department
                  <select
                    value={form.department}
                    onChange={(event) => updateField('department', event.target.value)}
                    className={selectClass}
                  >
                    {departments.map((dept) => (
                      <option key={dept}>{dept}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">
                  Designation / Job Title
                  <input
                    value={form.designation}
                    onChange={(event) => updateField('designation', event.target.value)}
                    className={inputClass}
                    placeholder="e.g. Nurse Coordinator, Receptionist"
                    required
                  />
                </label>
              </>
            )}

            {message && (
              <p role="alert" className="sm:col-span-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 cursor-pointer"
            >
              {isLoading ? 'Creating account...' : `Create ${role.toLowerCase()} account`}{' '}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link href="/auth/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="neon-page neon-grid relative flex min-h-screen items-center justify-center text-white">
          <div className="text-cyan-300 font-bold">Loading...</div>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
