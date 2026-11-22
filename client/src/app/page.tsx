import Link from "next/link";
import {
  HeartPulse,
  Stethoscope,
  User,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Bed,
  Calendar,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white selection:bg-cyan-400 selection:text-slate-950 bg-transparent">
      {/* Floating Glass Header Navigation */}
      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-6">
        <div className="glass-card flex items-center justify-between rounded-2xl px-6 py-3.5 backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 group-hover:scale-105 transition">
              <HeartPulse size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-black tracking-[0.2em] text-white">CARENOVA</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase text-cyan-300/80 tracking-wider">
                Healthcare OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live System Online</span>
            </div>
            <Link
              href="/auth/login"
              className="glass-pill px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-xl transition"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="glass-btn-primary px-4 py-2 text-xs font-bold text-slate-950 rounded-xl transition shadow-md shadow-cyan-400/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 lg:px-12">
        <div className="flex flex-col items-center text-center">
          {/* Glass Pill Announcement */}
          <div className="float-element mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Sparkles size={14} className="text-cyan-300" />
            <span>Next-Generation Glassmorphic Hospital Operations</span>
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl leading-none">
            Care coordination,{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-fuchsia-300 bg-clip-text text-transparent">
              reimagined.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 font-light">
            An ultra-sleek, unified healthcare operating system with dedicated portals for{" "}
            <strong className="text-amber-300 font-semibold">Super Admins</strong>,{" "}
            <strong className="text-emerald-300 font-semibold">Doctors</strong>,{" "}
            <strong className="text-cyan-300 font-semibold">Patients</strong>, and{" "}
            <strong className="text-purple-300 font-semibold">Hospital Staff</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="glass-btn-primary rounded-2xl px-8 py-4 font-bold text-slate-950 transition flex items-center gap-2.5 text-sm sm:text-base cursor-pointer"
            >
              Log in to Portal <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/register"
              className="glass-card-interactive rounded-2xl px-8 py-4 font-semibold text-white transition text-sm sm:text-base cursor-pointer"
            >
              Create New Account
            </Link>
          </div>

          {/* Live Metrics Glass Strip */}
          <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-300">100+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Registered Patients</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">11</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Clinical Doctors</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">35</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Wards & ICU Beds</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-fuchsia-300">100%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Real-time Triage</p>
            </div>
          </div>
        </div>

        {/* 4 Glassmorphism Role Cards */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-cyan-400">Adaptive Experience</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Tailored Portals for Every Role</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Super Admin Card */}
            <div className="glass-card-interactive p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-4">
                  <ShieldCheck size={26} />
                </div>
                <h3 className="text-lg font-bold text-white">Super Admin</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Full root command authority over all 114 members, system diagnostics, hospital finances, and complete records.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/auth/login?quick=superadmin"
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5 transition"
                >
                  1-Click Login <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Doctor Card */}
            <div className="glass-card-interactive p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mb-4">
                  <Stethoscope size={26} />
                </div>
                <h3 className="text-lg font-bold text-white">Doctor Portal</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Daily appointment agendas, active triage queue, clinical diagnoses, vital records, and digital prescriptions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/auth/login?quick=doctor"
                  className="text-xs font-bold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1.5 transition"
                >
                  1-Click Login <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Patient Card */}
            <div className="glass-card-interactive p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mb-4">
                  <User size={26} />
                </div>
                <h3 className="text-lg font-bold text-white">Patient Experience</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Direct appointment scheduling, personal health records, prescription logs, and transparent billing invoices.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/auth/register?role=patient"
                  className="text-xs font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1.5 transition"
                >
                  Register as Patient <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Staff Card */}
            <div className="glass-card-interactive p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-400/20 border border-purple-400/40 text-purple-300 flex items-center justify-center mb-4">
                  <Briefcase size={26} />
                </div>
                <h3 className="text-lg font-bold text-white">Hospital Staff</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Real-time bed management, emergency triage admissions, patient check-in workflows, and invoice processing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/auth/register?role=staff"
                  className="text-xs font-bold text-purple-300 hover:text-purple-200 inline-flex items-center gap-1.5 transition"
                >
                  Register as Staff <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Role Registration Shortcuts */}
        <div className="mt-16 glass-card p-8 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Ready to join CareNova?</h3>
              <p className="mt-1 text-sm text-slate-400">
                Choose your registration role or sign in immediately using pre-configured demo credentials.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register?role=patient"
                className="glass-pill px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 flex items-center gap-2"
              >
                <User size={15} /> Patient Sign Up
              </Link>
              <Link
                href="/auth/register?role=doctor"
                className="glass-pill px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2"
              >
                <Stethoscope size={15} /> Doctor Sign Up
              </Link>
              <Link
                href="/auth/register?role=staff"
                className="glass-pill px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-300 flex items-center gap-2"
              >
                <Briefcase size={15} /> Staff Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
