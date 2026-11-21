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
      setError(response?.data?.message || 'Unable to load appointments. Sign in first.');
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

    if (currentUser?.role === 'ADMIN' && form.patientId) {
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
    <section className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
            <CalendarDays size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-sm text-gray-500">Manage doctor consultations, time slots, and schedule.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition"
        >
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Appointments Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading && <p className="p-8 text-center text-sm text-gray-500">Loading appointments...</p>}

        {!isLoading && appointments.length === 0 && (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto text-gray-300 mb-3" size={42} />
            <h2 className="text-base font-semibold text-gray-900">No appointments yet</h2>
            <p className="mt-1 text-sm text-gray-500">Appointments booked by patients or staff will appear here.</p>
          </div>
        )}

        {!isLoading && appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
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
              <tbody className="divide-y divide-gray-100">
                {appointments.map((a) => {
                  const statusColors: Record<string, string> = {
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    Confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
                    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                    'No Show': 'bg-gray-100 text-gray-600 border-gray-200',
                  };

                  return (
                    <tr key={a._id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 font-semibold text-gray-900">{a.appointmentId}</td>
                      <td className="px-5 py-4 text-gray-700">
                        <p className="font-medium">{a.patient?.name || 'Patient'}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        <p className="font-medium">{a.doctor?.name || 'Doctor'}</p>
                        {a.doctor?.specialization && (
                          <p className="text-xs text-gray-400">{a.doctor.specialization}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                        <p className="font-medium">{new Date(a.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {a.startTime} - {a.endTime}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{a.reason || 'General'}</td>
                      <td className="px-5 py-4 text-gray-800 font-semibold">
                        PKR {a.consultationFee.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            statusColors[a.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                          <div className="flex items-center justify-end gap-1.5">
                            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'DOCTOR') && (
                              <button
                                onClick={() => handleUpdateStatus(a._id, 'Completed')}
                                title="Mark Completed"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(a._id, 'Cancelled')}
                              title="Cancel Appointment"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="text-cyan-600" size={20} /> Book Appointment
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <p className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </p>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {currentUser?.role === 'ADMIN' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Patient</label>
                  <select
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-cyan-500"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Doctor</label>
                <select
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-cyan-500"
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
                  <p className="mt-1 text-xs text-cyan-600">
                    Consultation fee: PKR {selectedDoctor.consultationFee.toLocaleString()} (frozen upon booking)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Time (HH:MM)</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Visit (Optional)</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. Follow-up consultation, fever, chest pain..."
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition disabled:opacity-50"
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
