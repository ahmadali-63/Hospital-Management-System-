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
        <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-400/30">
                <ShieldCheck size={14} className="text-amber-600" />
                Root Authority & Oversight
              </div>
              <h2 className="mt-2 text-xl font-bold text-gray-900 flex items-center gap-2">
                👑 Super Admin Command Center
              </h2>
              <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                Logged in as <strong className="text-amber-900 font-semibold">{currentUser?.name || 'Super Admin'}</strong> ({currentUser?.email || 'superadmin@hms.com'}).
                You have master authority to inspect and manage <strong>everybody&apos;s data and operations</strong> across CareNova.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-sm"
              >
                <Users size={14} /> View All Members ({totalUsers})
              </Link>
              <Link
                href="/dashboard/doctors"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                <Stethoscope size={14} /> Doctors Directory
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Live system status and hospital operational metrics.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition"
          >
            <CalendarIcon size={14} /> Book Appointment
          </Link>
          <Link
            href="/dashboard/beds"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            <Bed size={14} /> Bed Management
          </Link>
          <Link
            href="/dashboard/emergency"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
          >
            <Siren size={14} /> Emergency Cases
          </Link>
        </div>
      </div>

      {/* Primary 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/patients" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition group-hover:border-cyan-300 group-hover:shadow-md">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4 group-hover:bg-blue-100 transition">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : totalPatients.toLocaleString()}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-cyan-600" />
          </div>
        </Link>

        <Link href="/dashboard/doctors" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition group-hover:border-cyan-300 group-hover:shadow-md">
            <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4 group-hover:bg-green-100 transition">
              <UserPlus className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Available Doctors</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : `${availableDoctors} / ${totalDoctors}`}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-cyan-600" />
          </div>
        </Link>

        <Link href="/dashboard/appointments" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition group-hover:border-cyan-300 group-hover:shadow-md">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4 group-hover:bg-purple-100 transition">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Today&apos;s Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : todayAppointments.toLocaleString()}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-cyan-600" />
          </div>
        </Link>

        <Link href="/dashboard/beds" className="block group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition group-hover:border-cyan-300 group-hover:shadow-md">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600 mr-4 group-hover:bg-orange-100 transition">
              <Activity className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Available Beds</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : `${availableBeds} / ${totalBeds}`}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-cyan-600" />
          </div>
        </Link>
      </div>

      {/* Super Admin Master Access Grid (Everybody's Things & Information) */}
      {isSuperAdmin && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Full Hospital Operations & Information
            </h3>
            <span className="text-xs text-gray-400">Master Directory</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/dashboard/users"
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-md transition text-center group"
            >
              <ShieldCheck className="mx-auto text-amber-500 group-hover:scale-110 transition" size={24} />
              <p className="mt-2 text-xs font-bold text-gray-900">All Members</p>
              <p className="text-[10px] text-gray-500">Total: {totalUsers}</p>
            </Link>

            <Link
              href="/dashboard/doctors"
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-md transition text-center group"
            >
              <Stethoscope className="mx-auto text-emerald-500 group-hover:scale-110 transition" size={24} />
              <p className="mt-2 text-xs font-bold text-gray-900">Doctors</p>
              <p className="text-[10px] text-gray-500">{totalDoctors} registered</p>
            </Link>

            <Link
              href="/dashboard/patients"
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition text-center group"
            >
              <Users className="mx-auto text-blue-500 group-hover:scale-110 transition" size={24} />
              <p className="mt-2 text-xs font-bold text-gray-900">Patients</p>
              <p className="text-[10px] text-gray-500">{totalPatients} records</p>
            </Link>

            <Link
              href="/dashboard/clinical"
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-purple-400 hover:shadow-md transition text-center group"
            >
              <ClipboardList className="mx-auto text-purple-500 group-hover:scale-110 transition" size={24} />
              <p className="mt-2 text-xs font-bold text-gray-900">Clinical Records</p>
              <p className="text-[10px] text-gray-500">Consultations</p>
            </Link>

            <Link
              href="/dashboard/billing"
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-md transition text-center group"
            >
              <FileText className="mx-auto text-emerald-600 group-hover:scale-110 transition" size={24} />
              <p className="mt-2 text-xs font-bold text-gray-900">Billing & Invoices</p>
              <p className="text-[10px] text-gray-500">Finances</p>
            </Link>

            <Link
              href="/dashboard/emergency"
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-rose-400 hover:shadow-md transition text-center group"
            >
              <Siren className="mx-auto text-rose-500 group-hover:scale-110 transition" size={24} />
              <p className="mt-2 text-xs font-bold text-gray-900">Emergency Ward</p>
              <p className="text-[10px] text-gray-500">Live triage</p>
            </Link>
          </div>
        </div>
      )}

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Weekly Patient Traffic</h2>
            <span className="text-xs text-gray-400">Current Week</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="appointments" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Admissions</h2>
            <Link href="/dashboard/beds" className="text-xs text-cyan-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {stats && stats.recentAdmissions && stats.recentAdmissions.length > 0 ? (
              stats.recentAdmissions.map((adm) => (
                <div key={adm._id} className="flex items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs mr-3">
                    {adm.patient?.name ? adm.patient.name.charAt(0) : 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {adm.patient?.name || 'Admitted Patient'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {adm.ward?.name || 'General Ward'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(adm.admissionDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bed className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm text-gray-500">No active admissions recorded.</p>
                <Link
                  href="/dashboard/beds"
                  className="mt-2 inline-block text-xs font-semibold text-cyan-600 hover:underline"
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
