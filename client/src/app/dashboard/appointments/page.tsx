'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { CalendarDays, Plus, Clock, X, Check, Ban } from 'lucide-react';
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
  patient?: { _id: string; name: string; patientId?: string };
  doctor?: { _id: string; name: string; specialization?: string };
};

type DoctorOption = {
  _id: string;
  name: string;
  specialization: string;
  consultationFee: number;
};

type PatientOption = {
  _id: string;
  name: string;
  patientId: string;
};

type UserInfo = {
  role?: string;
};

type AppointmentPayload = {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  patientId?: string;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Book Modal
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    doctorId: '',
    patientId: '',
    date: '',
    startTime: '09:00',
    endTime: '09:30',
    reason: '',
  });

  async function loadAppointments() {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get<{ data: { appointments: Appointment[] } }>('/appointments');
      setAppointments(res.data.data.appointments || []);

      // Preload doctors & patients for booking
      api.get<{ data: { doctors: DoctorOption[] } }>('/doctors').then((r) => {
        setDoctors(r.data.data.doctors || []);
      }).catch(() => {});

      api.get<{ data: { patients: PatientOption[] } }>('/patients').then((r) => {
        setPatients(r.data.data.patients || []);
      }).catch(() => {});
    } catch (requestError) {
      const response = (requestError as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Unable to load appointments. Log in first.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}

    const timeoutId = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    setModalError('');

    if (!form.doctorId || !form.date || !form.startTime || !form.endTime) {
      setModalError('Please fill out all required fields.');
      return;
    }

    const payload: AppointmentPayload = {
      doctorId: form.doctorId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      reason: form.reason || undefined,
    };

    if ((currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && form.patientId) {
      payload.patientId = form.patientId;
    }

    try {
      setIsSubmitting(true);
      await api.post('/appointments', payload);
      setSuccessMsg('Appointment booked successfully.');
      setShowModal(false);
      setForm({
        doctorId: '',
        patientId: '',
        date: '',
        startTime: '09:00',
        endTime: '09:30',
        reason: '',
      });
      await loadAppointments();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setModalError(response?.data?.message || 'Booking failed. Time slot may already be reserved.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setSuccessMsg(`Appointment status updated to ${newStatus}.`);
      await loadAppointments();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Failed to update status.');
    }
  }

  const selectedDoctor = doctors.find((d) => d._id === form.doctorId);

  return (
    <section className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <CalendarDays size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Appointments</h1>
            <p className="text-sm text-slate-400 font-light">Manage doctor consultations, time slots, and schedule.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setShowModal(true);
          }}
          className="glass-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-lg"
        >
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-sm flex items-center justify-between backdrop-blur-md">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-sm flex items-center justify-between backdrop-blur-md">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Appointments Table */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border-white/10">
        {isLoading && <p className="p-8 text-center text-sm text-slate-400">Loading appointments...</p>}

        {!isLoading && appointments.length === 0 && (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto text-slate-500 mb-3" size={42} />
            <h2 className="text-base font-bold text-white">No appointments yet</h2>
            <p className="mt-1 text-sm text-slate-400">Appointments booked by patients or staff will appear here.</p>
          </div>
        )}

        {!isLoading && appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Appointment</th>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Doctor</th>
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Fee</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((a) => {
                  const statusColors: Record<string, string> = {
                    Pending: 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]',
                    Confirmed: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]',
                    'In Progress': 'bg-purple-500/25 text-purple-300 border-purple-400/50 shadow-[0_0_10px_rgba(192,132,252,0.3)] animate-pulse',
                    Completed: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
                    Cancelled: 'bg-rose-500/25 text-rose-300 border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
                    'No Show': 'bg-slate-600/30 text-slate-300 border-slate-500/40',
                  };

                  return (
                    <tr key={a._id} className="hover:bg-white/[0.04] transition">
                      <td className="px-5 py-4 font-mono font-bold text-white">{a.appointmentId}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{a.patient?.name || 'Patient'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{a.doctor?.name || 'Doctor'}</p>
                        {a.doctor?.specialization && (
                          <p className="text-xs text-slate-400">{a.doctor.specialization}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-slate-200">{new Date(a.date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Clock size={12} className="text-cyan-400" /> {a.startTime} - {a.endTime}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-300 max-w-xs truncate">{a.reason || 'General'}</td>
                      <td className="px-5 py-4 text-amber-300 font-semibold font-mono">
                        PKR {a.consultationFee.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                            statusColors[a.status] || 'bg-slate-700/50 text-slate-200 border-slate-500/40'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                          <div className="flex items-center justify-end gap-1.5">
                            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'DOCTOR') && (
                              <button
                                onClick={() => handleUpdateStatus(a._id, 'Completed')}
                                title="Mark Completed"
                                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 transition cursor-pointer"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(a._id, 'Cancelled')}
                              title="Cancel Appointment"
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-400/30 transition cursor-pointer"
                            >
                              <Ban size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border-white/15">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="text-cyan-400" size={20} /> Book Appointment
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <p className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-medium">
                {modalError}
              </p>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Patient</label>
                  <select
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.patientId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Doctor</label>
                <select
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} — {d.specialization} (PKR {d.consultationFee.toLocaleString()})
                    </option>
                  ))}
                </select>
                {selectedDoctor && (
                  <p className="mt-1 text-xs text-cyan-300">
                    Consultation fee: PKR {selectedDoctor.consultationFee.toLocaleString()} (frozen upon booking)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time (HH:MM)</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Visit (Optional)</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. Follow-up consultation, fever, chest pain..."
                  rows={2}
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-btn-primary px-5 py-2 text-xs font-bold text-slate-950 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
