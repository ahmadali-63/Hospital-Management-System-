'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect, Suspense } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  Briefcase,
  User,
} from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/services/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Mode States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'NEW_PASSWORD'>('EMAIL');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Auto-fill from query param (e.g. ?quick=superadmin)
  useEffect(() => {
    const quick = searchParams.get('quick')?.toLowerCase();
    if (quick === 'superadmin') {
      setEmail('superadmin@hms.com');
      setPassword('superadmin12345');
    } else if (quick === 'doctor') {
      setEmail('doctor01@hms.com');
      setPassword('doctor123');
    }
  }, [searchParams]);

  function toggleShowPassword() {
    setShowPassword((prev) => !prev);
  }

  async function executeLogin(loginEmail: string, loginPass: string) {
    setMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !/^\S+@\S+\.\S+$/.test(loginEmail)) {
      return setMessage('Enter a valid email address.');
    }
    if (loginPass.length < 6) {
      return setMessage('Password must be at least 6 characters.');
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', {
        email: loginEmail.trim(),
        password: loginPass,
      });

      const user = response.data?.data?.user;
      const token = response.data?.data?.token;

      if (!token || !user) {
        throw new Error('Invalid login response from server.');
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
      const resp = (error as AxiosError<{ message?: string }>).response;
      setMessage(resp?.data?.message || 'Unable to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    executeLogin(email, password);
  }

  // Quick 1-Click Role Logins
  function handleQuickLogin(roleType: 'SUPER_ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT') {
    if (roleType === 'SUPER_ADMIN') {
      setEmail('superadmin@hms.com');
      setPassword('superadmin12345');
      executeLogin('superadmin@hms.com', 'superadmin12345');
    } else if (roleType === 'DOCTOR') {
      setEmail('doctor01@hms.com');
      setPassword('doctor123');
      executeLogin('doctor01@hms.com', 'doctor123');
    } else if (roleType === 'STAFF') {
      setEmail('ahmad@gmail.com');
      setPassword('ahmad12345');
      executeLogin('ahmad@gmail.com', 'ahmad12345');
    } else if (roleType === 'PATIENT') {
      setEmail('patient001@hms.com');
      setPassword('patient123');
      executeLogin('patient001@hms.com', 'patient123');
    }
  }

  // Handle Forgot Password - Step 1: Verify Email
  async function handleVerifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSuccessMessage('');

    if (!forgotEmail.trim() || !/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      return setMessage('Please enter a valid registered email address.');
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/forgot-password', {
        email: forgotEmail.trim(),
      });
      setSuccessMessage(response.data?.message || 'Email verified. Enter your new password below.');
      setForgotStep('NEW_PASSWORD');
    } catch (error) {
      const resp = (error as AxiosError<{ message?: string }>).response;
      setMessage(resp?.data?.message || 'No account found with this email address.');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Forgot Password - Step 2: Set New Password
  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSuccessMessage('');

    if (newPassword.length < 6) {
      return setMessage('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setMessage('Passwords do not match. Please re-enter.');
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        newPassword,
      });

      setSuccessMessage(response.data?.message || 'Password reset successfully! You can now log in.');
      setEmail(forgotEmail.trim());
      setPassword(newPassword);
      setIsForgotMode(false);
      setForgotStep('EMAIL');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const resp = (error as AxiosError<{ message?: string }>).response;
      setMessage(resp?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="neon-page neon-grid relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 text-white">
      {/* Background Orbs with pointer-events-none */}
      <div className="neon-orb absolute -left-24 top-12 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="neon-orb absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />

      <section className="neon-rise relative w-full max-w-md rounded-3xl border border-white/20 bg-white/[0.08] p-8 shadow-[0_0_70px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-10 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-cyan-300">
          <HeartPulse size={20} /> CARENOVA
        </Link>

        {/* Normal Login View */}
        {!isForgotMode ? (
          <>
            <div className="mt-8">
              <p className="text-sm font-medium text-fuchsia-300">Unified Portal Access</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Log in to continue managing care with confidence.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-300" htmlFor="password">
                    Password
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer select-none"
                    >
                      {showPassword ? 'Hide password' : 'Show password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setForgotEmail(email);
                        setMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs font-medium text-fuchsia-300 hover:text-fuchsia-200 transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 pr-12 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
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
                    {showPassword ? (
                      <EyeOff size={20} className="pointer-events-none" />
                    ) : (
                      <Eye size={20} className="pointer-events-none" />
                    )}
                  </button>
                </div>

                {/* Plain-text display when password visibility is active */}
                {showPassword && password && (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs text-cyan-200">
                    <span className="font-semibold text-cyan-400">Password preview:</span>
                    <span className="font-mono select-all text-white font-bold">{password}</span>
                  </div>
                )}
              </div>

              {message && (
                <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Logging in...' : 'Log in'} {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Quick One-Click Role Logins */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Quick 1-Click Role Logins:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('SUPER_ADMIN')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition cursor-pointer"
                >
                  <ShieldCheck size={14} /> Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('DOCTOR')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/20 transition cursor-pointer"
                >
                  <Stethoscope size={14} /> Doctor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('STAFF')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-400/40 bg-purple-400/10 px-2.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-400/20 transition cursor-pointer"
                >
                  <Briefcase size={14} /> Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('PATIENT')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20 transition cursor-pointer"
                >
                  <User size={14} /> Patient
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm">
              <span className="text-slate-400">New to CareNova?</span>
              <Link
                href="/auth/register"
                className="rounded-lg border border-fuchsia-300/50 bg-fuchsia-300/10 px-4 py-2 font-semibold text-fuchsia-200 transition hover:border-fuchsia-200 hover:bg-fuchsia-300/20"
              >
                Sign up
              </Link>
            </div>
          </>
        ) : (
          /* Forgot Password View */
          <>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setMessage('');
                  setSuccessMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition mb-3 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Log in
              </button>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-xs font-semibold text-fuchsia-300 border border-fuchsia-400/30">
                <KeyRound size={13} /> Password Recovery
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Reset password.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {forgotStep === 'EMAIL'
                  ? 'Enter your registered email address to verify your account.'
                  : 'Account verified! Choose a new password below.'}
              </p>
            </div>

            {forgotStep === 'EMAIL' ? (
              <form onSubmit={handleVerifyEmail} className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300" htmlFor="forgot-email">
                    Account email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
                    required
                  />
                </div>

                {message && (
                  <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? 'Verifying email...' : 'Continue to Reset'} {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-300" htmlFor="new-password">
                      New password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                    >
                      {showNewPassword ? 'Hide password' : 'Show password'}
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 pr-12 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-30 cursor-pointer rounded-lg p-2 transition select-none ${
                        showNewPassword
                          ? 'text-cyan-300 bg-cyan-400/20 border border-cyan-400/40 shadow-sm'
                          : 'text-slate-300 hover:text-cyan-300 hover:bg-white/[0.1]'
                      }`}
                    >
                      {showNewPassword ? <EyeOff size={19} className="pointer-events-none" /> : <Eye size={19} className="pointer-events-none" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300" htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
                    required
                  />
                </div>

                {message && (
                  <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? 'Updating password...' : 'Update Password & Log in'} {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="neon-page neon-grid relative flex min-h-screen items-center justify-center text-white">
          <div className="text-cyan-300 font-bold">Loading...</div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
