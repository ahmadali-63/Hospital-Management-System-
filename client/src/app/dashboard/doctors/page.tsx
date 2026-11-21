'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Search, Stethoscope, X, Calendar, UserPlus } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

type Department = {
  _id: string;
  name: string;
};

type Doctor = {
  _id: string;
  doctorId: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  status: string;
  department?: { _id: string; name: string };
  workingDays?: string[];
  workingHours?: { start: string; end: string };
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Doctor Modal
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    department: '',
    qualification: '',
    experience: 5,
    consultationFee: 1500,
    startHour: '09:00',
    endHour: '17:00',
  });

  async function loadData() {
    try {
      setIsLoading(true);
      setError('');

      const [docRes, deptRes] = await Promise.all([
        api.get<{ data: { doctors: Doctor[] } }>('/doctors'),
        api.get<{ data: { departments: Department[] } }>('/doctors/departments').catch(() => ({ data: { data: { departments: [] } } })),
      ]);

      setDoctors(docRes.data.data.doctors || []);
      setDepartments(deptRes.data.data.departments || []);
    } catch (requestError) {
      const response = (requestError as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Unable to load doctors. Log in first.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}

    loadData();
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.specialization} ${doctor.doctorId}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [doctors, search]);

  async function handleAddDoctor(e: React.FormEvent) {
    e.preventDefault();
    setModalError('');

    if (!form.name || !form.email || !form.password || !form.specialization || !form.department || !form.qualification) {
      setModalError('Please fill out all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/doctors', {
        name: form.name,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
        department: form.department,
        qualification: form.qualification,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: {
          start: form.startHour,
          end: form.endHour,
        },
      });

      setSuccessMsg('Doctor registered successfully.');
      setShowModal(false);
      setForm({
        name: '',
        email: '',
        password: '',
        specialization: '',
        department: '',
        qualification: '',
        experience: 5,
        consultationFee: 1500,
        startHour: '09:00',
        endHour: '17:00',
      });
      await loadData();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setModalError(response?.data?.message || 'Failed to add doctor.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <section className="max-w-7xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end pb-6 mb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
              <Stethoscope size={22} />
            </span>
            <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">Manage clinicians, specialties, and consultation availability.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block w-full sm:max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctors..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-400"
            />
          </label>

          {isAdmin && (
            <button
              onClick={() => {
                setModalError('');
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition"
            >
              <UserPlus size={18} /> Add Doctor
            </button>
          )}
        </div>
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading && <p className="p-8 text-center text-sm text-gray-500">Loading doctor records...</p>}

        {!isLoading && filteredDoctors.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-500">No doctors found.</p>
        )}

        {!isLoading && filteredDoctors.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">Doctor</th>
                  <th className="px-5 py-4">Specialty</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Fee</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-cyan-50/40">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{doctor.name}</p>
                      <p className="text-xs text-gray-500">{doctor.doctorId}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {doctor.specialization}
                      <p className="text-xs text-gray-500">{doctor.qualification}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {doctor.department?.name || 'General Medicine'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{doctor.experience} years</td>
                    <td className="px-5 py-4 text-gray-800 font-semibold">
                      PKR {doctor.consultationFee.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href="/dashboard/appointments"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition"
                      >
                        <Calendar size={13} /> Book Visit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && !error && (
        <p className="mt-3 text-sm text-gray-500">
          Showing {filteredDoctors.length} of {doctors.length} doctors.
        </p>
      )}

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-cyan-600" size={20} /> Register New Doctor
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

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Sarah Connor"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sarah@hms.com"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="Cardiologist, Neurologist..."
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="MBBS, FCPS"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fee (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.consultationFee}
                    onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    value={form.startHour}
                    onChange={(e) => setForm({ ...form, startHour: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Time (HH:MM)</label>
                  <input
                    type="time"
                    value={form.endHour}
                    onChange={(e) => setForm({ ...form, endHour: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
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
                  {isSubmitting ? 'Registering...' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
