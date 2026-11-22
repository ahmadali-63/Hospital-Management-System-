'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Search, Users, Calendar, Bed, FileText } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

type Patient = {
  _id: string;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  address: string;
  dateOfBirth: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await api.get<{ data: { patients: Patient[] } }>('/patients');
        setPatients(response.data.data.patients);
      } catch (requestError) {
        const response = (requestError as AxiosError<{ message?: string }>).response;
        setError(response?.data?.message || 'Unable to load patients. Log in with an admin account first.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) =>
      [patient.patientId, patient.name, patient.email, patient.phone].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [patients, search]);

  return (
    <section className="max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              <Users size={22} />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Patients Directory</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400 font-light">Review patient profiles, contact details, and records.</p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patients..."
            className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border-white/10">
        {isLoading && <p className="p-8 text-center text-sm text-slate-400">Loading patient records...</p>}
        {!isLoading && error && (
          <p role="alert" className="m-5 rounded-xl border border-rose-400/30 bg-rose-500/15 p-4 text-sm text-rose-200">
            {error}
          </p>
        )}
        {!isLoading && !error && filteredPatients.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400">No patients match your search.</p>
        )}
        {!isLoading && !error && filteredPatients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Gender</th>
                  <th className="px-5 py-4">Blood group</th>
                  <th className="px-5 py-4">Date of birth</th>
                  <th className="px-5 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-white/[0.04] transition">
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-bold text-white">{patient.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{patient.patientId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-200">{patient.email}</p>
                      <p className="text-xs text-slate-400">{patient.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{patient.gender}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/30">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-300 font-mono">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/dashboard/appointments"
                          title="Book Appointment"
                          className="p-2 rounded-xl glass-pill text-cyan-300 hover:text-white hover:border-cyan-400/50 transition cursor-pointer shadow-sm"
                        >
                          <Calendar size={14} />
                        </Link>
                        <Link
                          href="/dashboard/beds"
                          title="Admit to Bed"
                          className="p-2 rounded-xl glass-pill text-emerald-300 hover:text-white hover:border-emerald-400/50 transition cursor-pointer shadow-sm"
                        >
                          <Bed size={14} />
                        </Link>
                        <Link
                          href="/dashboard/billing"
                          title="View Invoices"
                          className="p-2 rounded-xl glass-pill text-purple-300 hover:text-white hover:border-purple-400/50 transition cursor-pointer shadow-sm"
                        >
                          <FileText size={14} />
                        </Link>
                      </div>
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
          Showing {filteredPatients.length} of {patients.length} patients.
        </p>
      )}
    </section>
  );
}
