'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, HeartPulse, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/services/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'NEW_PASSWORD'>('EMAIL');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleVerifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setSuccessMessage('');

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return setMessage('Please enter a valid registered email address.');
    }

    try {
      setIsLoading(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccessMessage(res.data?.message || 'Email verified. You can now choose a new password.');
      setStep('NEW_PASSWORD');
    } catch (err) {
      const resp = (err as AxiosError<{ message?: string }>).response;
      setMessage(resp?.data?.message || 'No registered account found with this email address.');
    } finally {
      setIsLoading(false);
    }
  }

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
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        newPassword,
      });

      setSuccessMessage(res.data?.message || 'Password reset successfully! Redirecting to Log in...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err) {
      const resp = (err as AxiosError<{ message?: string }>).response;
      setMessage(resp?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="neon-page neon-grid relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 text-white">
      <div className="neon-orb absolute -left-24 top-12 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="neon-orb absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <section className="neon-rise relative w-full max-w-md rounded-3xl border border-white/20 bg-white/[0.08] p-8 shadow-[0_0_70px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-cyan-300">
          <HeartPulse size={20} /> CARENOVA
        </Link>

        <div className="mt-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition mb-3"
          >
            <ArrowLeft size={14} /> Back to Log in
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-xs font-semibold text-fuchsia-300 border border-fuchsia-400/30">
            <KeyRound size={13} /> Account Recovery
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Reset your password.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {step === 'EMAIL'
              ? 'Enter your registered email address to verify your account.'
              : 'Choose your new password below.'}
          </p>
        </div>

        {step === 'EMAIL' ? (
          <form onSubmit={handleVerifyEmail} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="email">
                Account email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? 'Verifying email...' : 'Verify Email'} {!isLoading && <ArrowRight size={18} />}
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer select-none"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>
              <div className="relative mt-2">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 pr-12 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-30 cursor-pointer rounded-lg p-2 transition select-none ${
                    showPassword
                      ? 'text-cyan-300 bg-cyan-400/20 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-white/[0.1]'
                  }`}
                >
                  {showPassword ? <EyeOff size={19} className="pointer-events-none" /> : <Eye size={19} className="pointer-events-none" />}
                </button>
              </div>

              {showPassword && newPassword && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs text-cyan-200">
                  <span className="font-semibold text-cyan-400">Password preview:</span>
                  <span className="font-mono select-all text-white font-bold">{newPassword}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
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
      </section>
    </main>
  );
}
