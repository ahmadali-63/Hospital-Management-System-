import Link from "next/link";
import { HeartPulse, Stethoscope, User, Briefcase, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-400 selection:text-slate-950">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20 lg:px-12">
        <div className="flex items-center gap-2 mb-6 text-sm font-bold tracking-[0.2em] text-cyan-300">
          <HeartPulse size={22} />
          NEXUS CARE
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Hospital Management System MVP
        </p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">
          Care coordination, without the clutter.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Unified healthcare operations with personalized portals for Patients, Doctors, Staff, and Administrators.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-xl bg-cyan-400 px-6 py-3.5 font-bold text-slate-950 hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20 inline-flex items-center gap-2"
          >
            Log in <ArrowRight size={18} />
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white hover:border-cyan-300 hover:bg-white/10 transition"
          >
            Create Account
          </Link>
        </div>

        {/* Direct Role Registration Pills */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
            Direct Registration by Role:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/register?role=patient"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20 transition"
            >
              <User size={16} /> Patient Sign Up
            </Link>
            <Link
              href="/auth/register?role=doctor"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-400/20 transition"
            >
              <Stethoscope size={16} /> Doctor Sign Up
            </Link>
            <Link
              href="/auth/register?role=staff"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-medium text-purple-200 hover:bg-purple-400/20 transition"
            >
              <Briefcase size={16} /> Staff Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
