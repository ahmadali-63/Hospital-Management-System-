'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Siren,
  ClipboardList,
  Stethoscope,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
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
  patient?: {
    _id: string;
    patientId?: string;
    name: string;
    gender?: string;
    phone?: string;
  };
};

type EmergencyCase = {
  _id: string;
  emergencyId: string;
  patientName: string;
  triageLevel: 'Level 1 - Resuscitation' | 'Level 2 - Emergent' | 'Level 3 - Urgent' | 'Level 4 - Less Urgent' | 'Level 5 - Non-urgent';
  chiefComplaint: string;
  status: 'Admitted' | 'Treated' | 'Discharged';
  createdAt: string;
};

type UserProfile = {
  name: string;
  email: string;
  role: string;
};

export default function DoctorDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }

    async function loadDoctorData() {
      try {
        const [apptsRes, emergRes] = await Promise.allSettled([
          api.get<{ data: { appointments: Appointment[] } }>('/appointments'),
          api.get<{ data: { emergencyCases: EmergencyCase[] } }>('/emergency'),
        ]);

        if (apptsRes.status === 'fulfilled') {
          setAppointments(apptsRes.value.data.data.appointments || []);
        }
        if (emergRes.status === 'fulfilled') {
          setEmergencies(emergRes.value.data.data.emergencyCases || []);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctorData();
  }, []);

  async function handleStatusUpdate(id: string, newStatus: string) {
    try {
      setUpdatingId(id);
      setActionMsg(null);
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus as Appointment['status'] } : a))
      );
      setActionMsg({
        type: 'success',
        text: `Appointment status updated to "${newStatus}".`,
      });
    } catch (err) {
      const resp = (err as AxiosError<{ message?: string }>).response;
      setActionMsg({
        type: 'error',
        text: resp?.data?.message || 'Failed to update appointment status.',
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.date).toISOString().split('T')[0];
    return aptDate === today;
  });

  const activeEmergencies = emergencies.filter((e) => e.status !== 'Discharged');

  return (
    <div className="max-w-7xl space-y-8">
      {/* Doctor Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-lg border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30 mb-3">
              <Stethoscope size={14} /> Doctor Consultation Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dr. {user?.name || 'Practitioner'}
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Manage patient consultations, track your clinical workflow, and issue medical prescriptions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/clinical"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300 transition shadow-md shadow-emerald-400/20"
            >
              <ClipboardList size={16} /> Prescriptions & Records
            </Link>
            <Link
              href="/dashboard/patients"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur-sm"
            >
              <User size={16} /> Patient Registry
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Today&apos;s Appointments
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Calendar size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : todayAppointments.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Scheduled for today</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Assigned
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : appointments.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Patient consultations</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Emergencies
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <Siren size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : activeEmergencies.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Cases requiring care</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Completed Consults
            </span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {isLoading ? '...' : appointments.filter((a) => a.status === 'Completed').length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Successfully handled</p>
        </div>
      </div>

      {/* Main Grid: Doctor Appointments & Emergency Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments List (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="text-emerald-600" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Patient Consultation Schedule</h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Full Calendar
            </Link>
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-[500px] space-y-3">
            {isLoading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading schedule...</p>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No consultations assigned yet.
              </div>
            ) : (
              appointments.map((apt) => {
                const dateStr = new Date(apt.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const isActionable = apt.status !== 'Completed' && apt.status !== 'Cancelled';

                return (
                  <div
                    key={apt._id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">
                          {apt.patient?.name || 'Walk-in Patient'}
                        </span>
                        {apt.patient?.gender && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                            {apt.patient.gender}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border shadow-sm ${
                            apt.status === 'Completed'
                              ? 'bg-blue-500/25 text-blue-300 border-blue-400/50 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                              : apt.status === 'In Progress'
                              ? 'bg-purple-500/25 text-purple-300 border-purple-400/50 shadow-[0_0_10px_rgba(192,132,252,0.3)] animate-pulse'
                              : apt.status === 'Confirmed'
                              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                              : apt.status === 'Cancelled'
                              ? 'bg-rose-500/25 text-rose-300 border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                              : 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          {dateStr} • {apt.startTime} - {apt.endTime}
                        </span>
                        {apt.patient?.phone && <span>• Tel: {apt.patient.phone}</span>}
                      </div>
                      {apt.reason && (
                        <p className="mt-1 text-xs text-gray-600 italic">
                          Chief complaint / reason: &ldquo;{apt.reason}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {isActionable && (
                      <div className="flex items-center gap-2 shrink-0">
                        {apt.status !== 'In Progress' && (
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'In Progress')}
                            disabled={updatingId === apt._id}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
                          >
                            <PlayCircle size={13} /> Start
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'Completed')}
                          disabled={updatingId === apt._id}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          <CheckCircle size={13} /> Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'Cancelled')}
                          disabled={updatingId === apt._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                        >
                          <XCircle size={13} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Emergency Triage Feed (1 Column) */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Siren className="text-rose-600" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Emergency Cases</h2>
            </div>
            <Link
              href="/dashboard/emergency"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Emergency Ward
            </Link>
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-[500px] space-y-3">
            {isLoading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading emergencies...</p>
            ) : emergencies.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No active emergency cases reported.
              </div>
            ) : (
              emergencies.map((emg) => (
                <div
                  key={emg._id}
                  className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{emg.patientName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {emg.triageLevel.split(' - ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">
                    <strong>Complaint:</strong> {emg.chiefComplaint}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Status: {emg.status}</span>
                    <span>{new Date(emg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
