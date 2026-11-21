'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ClipboardList,
  FileText,
  HeartPulse,
  Clock,
  UserCheck,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/services/api';

type Appointment = {
  _id: string;
  appointmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  consultationFee: number;
  reason?: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  doctor?: {
    name: string;
    specialization?: string;
    department?: string;
  };
};

type Prescription = {
  _id: string;
  prescriptionId: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  createdAt: string;
  doctor?: { name: string; specialization?: string };
};

type Bill = {
  _id: string;
  billId: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
  createdAt: string;
};

type UserProfile = {
  name: string;
  email: string;
  role: string;
};

export default function PatientDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }

    async function loadPatientData() {
      try {
        const [apptsRes, prescRes, billsRes] = await Promise.allSettled([
          api.get<{ data: { appointments: Appointment[] } }>('/appointments'),
          api.get<{ data: { prescriptions: Prescription[] } }>('/clinical/prescriptions'),
          api.get<{ data: { bills: Bill[] } }>('/billing'),
        ]);

        if (apptsRes.status === 'fulfilled') {
          setAppointments(apptsRes.value.data.data.appointments || []);
        }
        if (prescRes.status === 'fulfilled') {
          setPrescriptions(prescRes.value.data.data.prescriptions || []);
        }
        if (billsRes.status === 'fulfilled') {
          setBills(billsRes.value.data.data.bills || []);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    }

    loadPatientData();
  }, []);

  async function handleCancelAppointment(id: string) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancellingId(id);
      setActionMsg(null);
      await api.patch(`/appointments/${id}/status`, { status: 'Cancelled' });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'Cancelled' } : a))
      );
      setActionMsg({ type: 'success', text: 'Appointment cancelled successfully.' });
    } catch (err) {
      const resp = (err as AxiosError<{ message?: string }>).response;
      setActionMsg({
        type: 'error',
        text: resp?.data?.message || 'Failed to cancel appointment.',
      });
    } finally {
      setCancellingId(null);
    }
  }

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'Confirmed' || a.status === 'Pending'
  );
  const totalBalanceDue = bills.reduce((acc, b) => acc + (b.balanceAmount || 0), 0);

  return (
    <div className="max-w-7xl space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-lg border border-cyan-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/30 mb-3">
              <HeartPulse size={14} /> Patient Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || 'Valued Patient'}
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Track your appointments, medical prescriptions, and billing invoices in one secure place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/appointments"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
            >
              <PlusCircle size={16} /> Book Appointment
            </Link>
            <Link
              href="/dashboard/clinical"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur-sm"
            >
              <ClipboardList size={16} /> View Records
            </Link>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {actionMsg.text}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Upcoming Visits
            </span>
            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
              <Calendar size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : upcomingAppointments.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Scheduled consultations</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Prescriptions
            </span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <ClipboardList size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : prescriptions.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Medical prescriptions</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Outstanding Balance
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <FileText size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : `$${totalBalanceDue.toFixed(2)}`}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {totalBalanceDue > 0 ? 'Pending payment' : 'All invoices settled'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Appointments
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <UserCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : appointments.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Lifetime clinic visits</p>
        </div>
      </div>

      {/* Main Content Sections: Appointments & Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Section */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="text-cyan-600" size={20} />
              <h2 className="text-lg font-bold text-gray-900">My Appointments</h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
            >
              Book New
            </Link>
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-96 space-y-3">
            {isLoading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No appointments scheduled yet.</p>
                <Link
                  href="/dashboard/appointments"
                  className="mt-3 inline-block rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700"
                >
                  Schedule Your First Appointment
                </Link>
              </div>
            ) : (
              appointments.map((apt) => {
                const dateStr = new Date(apt.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const isUpcoming = apt.status === 'Confirmed' || apt.status === 'Pending';

                return (
                  <div
                    key={apt._id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : 'Assigned Doctor'}
                        </span>
                        {apt.doctor?.specialization && (
                          <span className="text-xs text-gray-500">({apt.doctor.specialization})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                          <Clock size={13} /> {dateStr} • {apt.startTime} - {apt.endTime}
                        </span>
                        <span>• Fee: ${apt.consultationFee}</span>
                      </div>
                      {apt.reason && (
                        <p className="mt-1 text-xs text-gray-600 italic">Reason: &ldquo;{apt.reason}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          apt.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : apt.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                      {isUpcoming && (
                        <button
                          onClick={() => handleCancelAppointment(apt._id)}
                          disabled={cancellingId === apt._id}
                          className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 transition"
                        >
                          <XCircle size={13} />
                          {cancellingId === apt._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Prescriptions & Medications */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-purple-600" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Recent Prescriptions</h2>
            </div>
            <Link
              href="/dashboard/clinical"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline"
            >
              All Records
            </Link>
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-96 space-y-3">
            {isLoading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading prescriptions...</p>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No prescriptions issued yet. Consult with your doctor during your next visit.
              </div>
            ) : (
              prescriptions.map((presc) => (
                <div
                  key={presc._id}
                  className="p-4 rounded-xl border border-gray-100 bg-purple-50/20 hover:bg-purple-50/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">
                      Diagnosis: {presc.diagnosis}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(presc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {presc.doctor?.name && (
                    <p className="text-xs text-gray-500 mt-0.5">By Dr. {presc.doctor.name}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    {presc.medications?.map((med, idx) => (
                      <div key={idx} className="text-xs text-gray-700 flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-semibold text-purple-900">{med.name}</span>
                        <span>{med.dosage} • {med.frequency} • {med.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invoices & Billing */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="text-cyan-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">My Invoices & Billing</h2>
          </div>
          <Link
            href="/dashboard/billing"
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
          >
            Billing Overview
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Bill ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Paid Amount</th>
                <th className="px-6 py-3">Balance</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                    Loading billing history...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {bill.billId || bill._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${bill.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      ${bill.paidAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600">
                      ${bill.balanceAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          bill.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
