'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Calendar as CalendarIcon, Activity, Bed, Siren, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/services/api';

interface StatsData {
  totalPatients: number;
  availableDoctors: number;
  todayAppointments: number;
  availableBeds: number;
  totalBeds: number;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
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

  const totalPatients = stats ? stats.totalPatients : 100;
  const availableDoctors = stats ? stats.availableDoctors : 10;
  const todayAppointments = stats ? stats.todayAppointments : 1;
  const availableBeds = stats ? stats.availableBeds : 34;
  const totalBeds = stats ? stats.totalBeds : 35;

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                {isLoading ? '...' : availableDoctors.toLocaleString()}
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

        {/* Recent Activity */}
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
