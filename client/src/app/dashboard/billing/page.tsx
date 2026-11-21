 'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { FileText } from 'lucide-react';
import api from '@/services/api';

type Bill = { _id: string; billId: string; totalAmount: number; paidAmount: number; remainingAmount: number; status: string; createdAt: string; patient?: { name: string } };

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: { bills: Bill[] } }>('/billing').then((response) => setBills(response.data.data.bills)).catch((requestError) => {
      const response = (requestError as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Unable to load bills. Sign in first.');
    }).finally(() => setIsLoading(false));
  }, []);

  return <section className="max-w-7xl"><div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-100 p-2 text-cyan-700"><FileText size={22} /></span><div><h1 className="text-2xl font-bold text-gray-900">Billing</h1><p className="mt-1 text-gray-600">Track charges, payments, and outstanding balances.</p></div></div><div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">{isLoading && <p className="p-8 text-center text-sm text-gray-500">Loading bills...</p>}{!isLoading && error && <p role="alert" className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{!isLoading && !error && bills.length === 0 && <div className="p-12 text-center"><FileText className="mx-auto text-gray-300" size={42} /><h2 className="mt-4 font-semibold text-gray-900">No bills yet</h2><p className="mt-1 text-sm text-gray-500">Generated bills will appear here for review and payment tracking.</p></div>}{!isLoading && !error && bills.length > 0 && <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-4">Invoice</th><th className="px-5 py-4">Patient</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Paid</th><th className="px-5 py-4">Balance</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{bills.map((bill) => <tr key={bill._id}><td className="px-5 py-4 font-semibold text-gray-900">{bill.billId}</td><td className="px-5 py-4 text-gray-700">{bill.patient?.name || 'Patient'}</td><td className="px-5 py-4 text-gray-700">{new Date(bill.createdAt).toLocaleDateString()}</td><td className="px-5 py-4 text-gray-700">PKR {bill.totalAmount.toLocaleString()}</td><td className="px-5 py-4 text-emerald-700">PKR {bill.paidAmount.toLocaleString()}</td><td className="px-5 py-4 text-rose-700">PKR {bill.remainingAmount.toLocaleString()}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{bill.status}</span></td></tr>)}</tbody></table></div>}</div></section>;
}
