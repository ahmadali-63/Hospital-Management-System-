 'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { CalendarDays } from 'lucide-react';
import api from '@/services/api';

type Appointment = { _id: string; appointmentId: string; date: string; startTime: string; endTime: string; consultationFee: number; status: string; patient?: { name: string }; doctor?: { name: string } };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: { appointments: Appointment[] } }>('/appointments').then((response) => setAppointments(response.data.data.appointments)).catch((requestError) => {
      const response = (requestError as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Unable to load appointments. Sign in first.');
    }).finally(() => setIsLoading(false));
  }, []);

  return <section className="max-w-7xl"><div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-100 p-2 text-cyan-700"><CalendarDays size={22} /></span><div><h1 className="text-2xl font-bold text-gray-900">Appointments</h1><p className="mt-1 text-gray-600">Keep the day moving with a clear appointment schedule.</p></div></div><div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">{isLoading && <p className="p-8 text-center text-sm text-gray-500">Loading appointments...</p>}{!isLoading && error && <p role="alert" className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{!isLoading && !error && appointments.length === 0 && <div className="p-12 text-center"><CalendarDays className="mx-auto text-gray-300" size={42} /><h2 className="mt-4 font-semibold text-gray-900">No appointments yet</h2><p className="mt-1 text-sm text-gray-500">Appointments will appear here after a patient books a visit.</p></div>}{!isLoading && !error && appointments.length > 0 && <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-4">Appointment</th><th className="px-5 py-4">Patient</th><th className="px-5 py-4">Doctor</th><th className="px-5 py-4">Schedule</th><th className="px-5 py-4">Fee</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{appointments.map((appointment) => <tr key={appointment._id}><td className="px-5 py-4 font-semibold text-gray-900">{appointment.appointmentId}</td><td className="px-5 py-4 text-gray-700">{appointment.patient?.name || 'Patient'}</td><td className="px-5 py-4 text-gray-700">{appointment.doctor?.name || 'Doctor'}</td><td className="px-5 py-4 text-gray-700">{new Date(appointment.date).toLocaleDateString()}<p className="text-xs text-gray-500">{appointment.startTime} - {appointment.endTime}</p></td><td className="px-5 py-4 text-gray-700">PKR {appointment.consultationFee.toLocaleString()}</td><td className="px-5 py-4"><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{appointment.status}</span></td></tr>)}</tbody></table></div>}</div></section>;
}
