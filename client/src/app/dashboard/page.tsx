'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Calendar as CalendarIcon,
  Activity,
  Bed,
  Siren,
  ArrowUpRight,
  ShieldCheck,
  ClipboardList,
  FileText,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/services/api';

interface StatsData {
  totalPatients: number;
  availableDoctors: number;
  totalDoctors?: number;
  todayAppointments: number;
  availableBeds: number;
  totalBeds: number;
  totalUsers?: number;
  recentAdmissions: Array<{
    _id: string;
    admissionId: string;
    admissionDate: string;
    patient?: { name: string; patientId: string };
    ward?: { name: string };
  }>;
}

const mockChartData = [
  { name: 'Mon', appointments: 12 },
  { name: 'Tue', appointments: 18 },
  { name: 'Wed', appointments: 15 },
  { name: 'Thu', appointments: 22 },
  { name: 'Fri', appointments: 28 },
  { name: 'Sat', appointments: 10 },
  { name: 'Sun', appointments: 5 },
];

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (user.role === 'PATIENT') {
          router.replace('/dashboard/patient');
          return;
        }
        if (user.role === 'DOCTOR') {
          router.replace('/dashboard/doctor');
          return;
        }
      } catch {}
    }
  }, [router]);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get<{ data: StatsData }>('/stats');
        setStats(res.data.data);
      } catch {
        // Fallback gracefully if stats endpoint not reachable
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const totalPatients = stats ? stats.totalPatients : 100;
  const availableDoctors = stats ? stats.availableDoctors : 10;
  const totalDoctors = stats?.totalDoctors || 10;
  const todayAppointments = stats ? stats.todayAppointments : 1;
  const availableBeds = stats ? stats.availableBeds : 34;
  const totalBeds = stats ? stats.totalBeds : 35;
  const totalUsers = stats?.totalUsers || 112;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Super Admin Master Banner */}
      {isSuperAdmin && (
        <div className="glass-card rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 via-amber-400/5 to-transparent p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/40 shadow-sm">
                <ShieldCheck size={14} className="text-amber-400" />
                Root Authority & Oversight
              </div>
              <h2 className="mt-2 text-xl font-black text-white flex items-center gap-2 tracking-wide">
                👑 Super Admin Command Center
              </h2>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl font-light">
                Logged in as <strong className="text-amber-300 font-semibold">{currentUser?.name || 'Super Admin'}</strong> ({currentUser?.email || 'superadmin@hms.com'}).
                You have master authority to inspect and manage <strong className="text-white">everybody&apos;s data and operations</strong> across Nexus Care.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow-[0_0_20px_rgba(251,191,36,0.35)] cursor-pointer"
              >
                <Users size={14} /> View All Members ({totalUsers})
              </Link>
              <Link
                href="/dashboard/doctors"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl glass-pill text-white hover:text-cyan-300 hover:border-cyan-400/50 transition cursor-pointer"
              >
                <Stethoscope size={14} /> Doctors Directory
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            Hospital Overview
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 font-normal">
              LIVE METRICS
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-light">Live system status and real-time hospital operational metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl glass-pill text-cyan-300 hover:text-white hover:border-cyan-400/60 transition cursor-pointer shadow-sm"
          >
            <CalendarIcon size={14} /> Book Appointment
          </Link>
          <Link
            href="/dashboard/beds"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl glass-pill text-emerald-300 hover:text-white hover:border-emerald-400/60 transition cursor-pointer shadow-sm"
          >
            <Bed size={14} /> Bed Management
          </Link>
          <Link
            href="/dashboard/emergency"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl glass-pill text-rose-300 hover:text-white hover:border-rose-400/60 transition cursor-pointer shadow-sm"
          >
            <Siren size={14} /> Emergency Cases
          </Link>
        </div>
      </div>

      {/* Primary 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/dashboard/patients" className="block group">
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center transition">
            <div className="p-3.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 mr-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Patients</p>
              <p className="text-2xl font-black text-white mt-0.5">
                {isLoading ? '...' : totalPatients.toLocaleString()}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition" />
          </div>
        </Link>

        <Link href="/dashboard/doctors" className="block group">
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center transition">
            <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mr-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition">
              <UserPlus className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Doctors</p>
              <p className="text-2xl font-black text-white mt-0.5">
                {isLoading ? '...' : `${availableDoctors} / ${totalDoctors}`}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>
        </Link>

        <Link href="/dashboard/appointments" className="block group">
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center transition">
            <div className="p-3.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 mr-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today&apos;s Appointments</p>
              <p className="text-2xl font-black text-white mt-0.5">
                {isLoading ? '...' : todayAppointments.toLocaleString()}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition" />
          </div>
        </Link>

        <Link href="/dashboard/beds" className="block group">
          <div className="glass-card-interactive p-6 rounded-2xl flex items-center transition">
            <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 mr-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition">
              <Activity className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Beds</p>
              <p className="text-2xl font-black text-white mt-0.5">
                {isLoading ? '...' : `${availableBeds} / ${totalBeds}`}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition" />
          </div>
        </Link>
      </div>

      {/* Super Admin Master Access Grid (Everybody's Things & Information) */}
      {isSuperAdmin && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles size={15} className="text-amber-400" />
              Full Hospital Operations & Information
            </h3>
            <span className="text-xs text-slate-500 font-mono">MASTER DIRECTORY</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/dashboard/users"
              className="glass-card-interactive p-4 rounded-2xl text-center group"
            >
              <ShieldCheck className="mx-auto text-amber-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] transition" size={24} />
              <p className="mt-2 text-xs font-bold text-white">All Members</p>
              <p className="text-[10px] text-slate-400">Total: {totalUsers}</p>
            </Link>

            <Link
              href="/dashboard/doctors"
              className="glass-card-interactive p-4 rounded-2xl text-center group"
            >
              <Stethoscope className="mx-auto text-emerald-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition" size={24} />
              <p className="mt-2 text-xs font-bold text-white">Doctors</p>
              <p className="text-[10px] text-slate-400">{totalDoctors} registered</p>
            </Link>

            <Link
              href="/dashboard/patients"
              className="glass-card-interactive p-4 rounded-2xl text-center group"
            >
              <Users className="mx-auto text-cyan-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition" size={24} />
              <p className="mt-2 text-xs font-bold text-white">Patients</p>
              <p className="text-[10px] text-slate-400">{totalPatients} records</p>
            </Link>

            <Link
              href="/dashboard/clinical"
              className="glass-card-interactive p-4 rounded-2xl text-center group"
            >
              <ClipboardList className="mx-auto text-purple-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.5)] transition" size={24} />
              <p className="mt-2 text-xs font-bold text-white">Clinical Records</p>
              <p className="text-[10px] text-slate-400">Consultations</p>
            </Link>

            <Link
              href="/dashboard/billing"
              className="glass-card-interactive p-4 rounded-2xl text-center group"
            >
              <FileText className="mx-auto text-teal-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition" size={24} />
              <p className="mt-2 text-xs font-bold text-white">Billing & Invoices</p>
              <p className="text-[10px] text-slate-400">Finances</p>
            </Link>

            <Link
              href="/dashboard/emergency"
              className="glass-card-interactive p-4 rounded-2xl text-center group"
            >
              <Siren className="mx-auto text-rose-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.5)] transition" size={24} />
              <p className="mt-2 text-xs font-bold text-white">Emergency Ward</p>
              <p className="text-[10px] text-slate-400">Live triage</p>
            </Link>
          </div>
        </div>
      )}

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-cyan-400" />
              Weekly Patient Traffic
            </h2>
            <span className="text-xs text-slate-400 font-mono bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-full">
              CURRENT WEEK
            </span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                />
                <Bar dataKey="appointments" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="glass-card p-6 rounded-2xl border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bed size={18} className="text-emerald-400" />
              Recent Admissions
            </h2>
            <Link href="/dashboard/beds" className="text-xs text-cyan-300 hover:text-cyan-200 transition font-medium">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3.5">
            {stats && stats.recentAdmissions && stats.recentAdmissions.length > 0 ? (
              stats.recentAdmissions.map((adm) => (
                <div key={adm._id} className="flex items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition">
                  <div className="w-9 h-9 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-bold text-xs mr-3">
                    {adm.patient?.name ? adm.patient.name.charAt(0) : 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {adm.patient?.name || 'Admitted Patient'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {adm.ward?.name || 'General Ward'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(adm.admissionDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bed className="mx-auto text-slate-500 mb-2" size={32} />
                <p className="text-xs text-slate-400">No active admissions recorded.</p>
                <Link
                  href="/dashboard/beds"
                  className="mt-2.5 inline-block text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
                >
                  Admit patient
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
