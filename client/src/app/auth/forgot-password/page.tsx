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
      {/* Dynamic Animated Aurora Background Orbs */}
      <div className="neon-orb absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />
      <div className="neon-orb-reverse absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[110px] pointer-events-none" />
      <div className="neon-orb-orbit absolute top-1/2 -right-16 h-72 w-72 rounded-full bg-emerald-400/15 blur-[90px] pointer-events-none" />

      <section className="glass-card neon-rise relative w-full max-w-md rounded-3xl p-8 backdrop-blur-2xl sm:p-10 z-10">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-bold tracking-[0.2em] text-cyan-300 group">
          <div className="p-1.5 rounded-lg bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 group-hover:scale-105 transition">
            <HeartPulse size={18} className="animate-pulse" />
          </div>
          <span>CARENOVA</span>
        </Link>

        <div className="mt-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition mb-3"
          >
            <ArrowLeft size={14} /> Back to Log in
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-semibold text-fuchsia-300 border border-fuchsia-400/30">
            <KeyRound size={13} /> Account Recovery
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Reset your password.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300 font-light">
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
                className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>

            {message && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/15 backdrop-blur-md px-3.5 py-2.5 text-sm text-rose-200">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="glass-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-lg shadow-cyan-400/20"
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
                  className="glass-input w-full rounded-xl px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-30 cursor-pointer rounded-lg p-2 transition select-none ${showPassword
                    ? 'text-cyan-300 bg-cyan-400/20 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-white/[0.1]'
                    }`}
                >
                  {showPassword ? <EyeOff size={19} className="pointer-events-none" /> : <Eye size={19} className="pointer-events-none" />}
                </button>
              </div>

              {showPassword && newPassword && (
                <div className="mt-2 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/60 backdrop-blur-md px-3.5 py-2 text-xs text-cyan-200 shadow-inner">
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
                className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>

            {message && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/15 backdrop-blur-md px-3.5 py-2.5 text-sm text-rose-200">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{message}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 backdrop-blur-md px-3.5 py-2.5 text-sm text-emerald-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="glass-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-lg shadow-cyan-400/20"
            >
              {isLoading ? 'Updating password...' : 'Update Password & Log in'} {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
