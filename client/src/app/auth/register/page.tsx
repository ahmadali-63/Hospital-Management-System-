'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, HeartPulse } from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/services/api';

const initialForm = { name: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'Other', bloodGroup: 'O+', address: '', emergencyContact: '' };

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputClass = 'mt-2 w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-white outline-none shadow-inner shadow-white/[0.03] backdrop-blur-md transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-cyan-300/[0.08] focus:ring-2 focus:ring-cyan-300/20';
  const selectClass = `${inputClass} [color-scheme:dark] [&>option]:bg-slate-900 [&>option]:text-white`;

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setMessage('Enter a valid email address.');
    if (form.password.length < 6) return setMessage('Password must be at least 6 characters.');
    if (form.phone.trim().length < 10 || form.emergencyContact.trim().length < 10) return setMessage('Phone numbers must contain at least 10 characters.');
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', form);
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      router.push('/dashboard');
    } catch (error) {
      const response = (error as AxiosError<{ message?: string; errors?: Array<{ message?: string }> }>).response;
      const validationError = response?.data?.errors?.[0]?.message;
      setMessage(validationError || response?.data?.message || 'Registration failed. Check that the API and MongoDB are running.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="neon-page neon-grid relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-white">
      <div className="neon-orb absolute -left-24 top-12 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="neon-orb absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <section className="neon-rise relative w-full max-w-3xl rounded-3xl border border-white/20 bg-white/[0.08] p-7 shadow-[0_0_70px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-cyan-300"><HeartPulse size={20} /> NEXUS CARE</Link>
        <div className="mt-8"><p className="text-sm font-medium text-fuchsia-300">Patient onboarding</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Create your care profile.</h1><p className="mt-3 text-sm leading-6 text-slate-400">Your account and patient record will be stored securely in MongoDB.</p></div>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-300">Full name<input value={form.name} onChange={(event) => updateField('name', event.target.value)} className={inputClass} placeholder="Enter your full name" required /></label>
          <label className="text-sm font-medium text-slate-300">Email address<input type="email" autoComplete="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className={inputClass} placeholder="Enter your email" required /></label>
          <label className="text-sm font-medium text-slate-300">Password<span className="relative mt-2 block"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(event) => updateField('password', event.target.value)} className={`${inputClass} pr-12`} placeholder="At least 6 characters" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-cyan-300">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
          <label className="text-sm font-medium text-slate-300">Phone<input type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className={inputClass} placeholder="Enter phone number" required /></label>
          <label className="text-sm font-medium text-slate-300">Date of birth<input type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} className={inputClass} required /></label>
          <label className="text-sm font-medium text-slate-300">Gender<select value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className={selectClass}><option>Male</option><option>Female</option><option>Other</option></select></label>
          <label className="text-sm font-medium text-slate-300">Blood group<select value={form.bloodGroup} onChange={(event) => updateField('bloodGroup', event.target.value)} className={selectClass}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-300">Emergency contact<input value={form.emergencyContact} onChange={(event) => updateField('emergencyContact', event.target.value)} className={inputClass} placeholder="Enter emergency contact" required /></label>
          <label className="text-sm font-medium text-slate-300 sm:col-span-2">Address<textarea value={form.address} onChange={(event) => updateField('address', event.target.value)} className={`${inputClass} min-h-24 resize-y`} placeholder="Enter your address" required /></label>
          {message && <p role="alert" className="sm:col-span-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{message}</p>}
          <button disabled={isLoading} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{isLoading ? 'Creating profile...' : 'Create patient account'} {!isLoading && <ArrowRight size={18} />}</button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-400">Already registered? <Link href="/auth/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Sign in</Link></p>
      </section>
    </main>
  );
}
