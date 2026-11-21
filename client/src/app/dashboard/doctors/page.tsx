 'use client';

import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Search, Stethoscope } from 'lucide-react';
import api from '@/services/api';

type Doctor = { _id: string; doctorId: string; name: string; specialization: string; qualification: string; experience: number; consultationFee: number; status: string; department?: { name: string } };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: { doctors: Doctor[] } }>('/doctors').then((response) => setDoctors(response.data.data.doctors)).catch((requestError) => {
      const response = (requestError as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Unable to load doctors. Sign in first.');
    }).finally(() => setIsLoading(false));
  }, []);

  const filteredDoctors = useMemo(() => doctors.filter((doctor) => `${doctor.name} ${doctor.specialization} ${doctor.doctorId}`.toLowerCase().includes(search.toLowerCase())), [doctors, search]);

  return <section className="max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-100 p-2 text-cyan-700"><Stethoscope size={22} /></span><h1 className="text-2xl font-bold text-gray-900">Doctors</h1></div><p className="mt-2 text-gray-600">Manage clinicians, specialties, and availability.</p></div><label className="relative block w-full sm:max-w-xs"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search doctors" className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-400" /></label></div><div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">{isLoading && <p className="p-8 text-center text-sm text-gray-500">Loading doctor records...</p>}{!isLoading && error && <p role="alert" className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{!isLoading && !error && filteredDoctors.length === 0 && <p className="p-8 text-center text-sm text-gray-500">No doctors found.</p>}{!isLoading && !error && filteredDoctors.length > 0 && <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-4">Doctor</th><th className="px-5 py-4">Specialty</th><th className="px-5 py-4">Department</th><th className="px-5 py-4">Experience</th><th className="px-5 py-4">Fee</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredDoctors.map((doctor) => <tr key={doctor._id} className="hover:bg-cyan-50/40"><td className="px-5 py-4"><p className="font-semibold text-gray-900">{doctor.name}</p><p className="text-xs text-gray-500">{doctor.doctorId}</p></td><td className="px-5 py-4 text-gray-700">{doctor.specialization}<p className="text-xs text-gray-500">{doctor.qualification}</p></td><td className="px-5 py-4 text-gray-700">{doctor.department?.name || 'General Medicine'}</td><td className="px-5 py-4 text-gray-700">{doctor.experience} years</td><td className="px-5 py-4 text-gray-700">PKR {doctor.consultationFee.toLocaleString()}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{doctor.status}</span></td></tr>)}</tbody></table></div>}</div>{!isLoading && !error && <p className="mt-3 text-sm text-gray-500">Showing {filteredDoctors.length} of {doctors.length} doctors.</p>}</section>;
}
