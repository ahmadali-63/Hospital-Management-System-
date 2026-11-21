'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Search, Users } from 'lucide-react';
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
        setError(response?.data?.message || 'Unable to load patients. Sign in with an admin account first.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) => [patient.patientId, patient.name, patient.email, patient.phone].some((value) => value.toLowerCase().includes(term)));
  }, [patients, search]);

  return (
    <section className="max-w-7xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-cyan-100 p-2 text-cyan-700"><Users size={22} /></span>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          </div>
          <p className="mt-2 text-gray-600">Review patient profiles and care history.</p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients" className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
        </label>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading && <p className="p-8 text-center text-sm text-gray-500">Loading patient records...</p>}
        {!isLoading && error && <p role="alert" className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {!isLoading && !error && filteredPatients.length === 0 && <p className="p-8 text-center text-sm text-gray-500">No patients match your search.</p>}
        {!isLoading && !error && filteredPatients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-5 py-4">Patient</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Gender</th><th className="px-5 py-4">Blood group</th><th className="px-5 py-4">Date of birth</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-cyan-50/40">
                    <td className="whitespace-nowrap px-5 py-4"><p className="font-semibold text-gray-900">{patient.name}</p><p className="text-xs text-gray-500">{patient.patientId}</p></td>
                    <td className="px-5 py-4"><p className="text-gray-700">{patient.email}</p><p className="text-xs text-gray-500">{patient.phone}</p></td>
                    <td className="px-5 py-4 text-gray-700">{patient.gender}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{patient.bloodGroup}</span></td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!isLoading && !error && <p className="mt-3 text-sm text-gray-500">Showing {filteredPatients.length} of {patients.length} patients.</p>}
    </section>
  );
}
