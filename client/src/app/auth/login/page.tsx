'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, HeartPulse } from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function toggleShowPassword() {
    setShowPassword((prev) => !prev);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setMessage('Enter a valid email address.');
    if (password.length < 6) return setMessage('Password must be at least 6 characters.');

    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email: email.trim(), password });
      const user = response.data.data.user;
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'PATIENT') {
        router.push('/dashboard/patient');
      } else if (user.role === 'DOCTOR') {
        router.push('/dashboard/doctor');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      const response = (error as AxiosError<{ message?: string }>).response;
      setMessage(response?.data?.message || 'Unable to log in. Check that the API and MongoDB are running.');
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
          <HeartPulse size={20} /> NEXUS CARE
        </Link>
        <div className="mt-10">
          <p className="text-sm font-medium text-fuchsia-300">Secure staff and patient access</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Log in to continue managing care with confidence.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              placeholder="Enter your email"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-300" htmlFor="password">
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
                className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer rounded-lg p-1.5 transition select-none ${
                  showPassword
                    ? 'text-cyan-300 bg-cyan-400/20 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06]'
                }`}
              >
                {showPassword ? <EyeOff size={19} className="pointer-events-none" /> : <Eye size={19} className="pointer-events-none" />}
              </button>
            </div>
          </div>

          {message && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{message}</p>}
          <button disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Logging in...' : 'Log in'} {!isLoading && <ArrowRight size={18} />}</button>
        </form>
        <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm">
          <span className="text-slate-400">New to Nexus Care?</span>
          <Link href="/auth/register" className="rounded-lg border border-fuchsia-300/50 bg-fuchsia-300/10 px-4 py-2 font-semibold text-fuchsia-200 transition hover:border-fuchsia-200 hover:bg-fuchsia-300/20">Sign up</Link>
        </div>
      </section>
    </main>
  );
}
