'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { FileText, Plus, CreditCard, X } from 'lucide-react';
import api from '@/services/api';

type Bill = {
  _id: string;
  billId: string;
  consultationFee: number;
  bedCharges: number;
  emergencyCharges: number;
  otherCharges: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Partially Paid' | 'Paid';
  createdAt: string;
  patient?: { _id: string; name: string; patientId?: string };
};

type PatientOption = {
  _id: string;
  name: string;
  patientId: string;
};

type AppointmentOption = {
  _id: string;
  appointmentId: string;
  consultationFee: number;
  patient?: { _id: string; name: string };
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Generate Bill Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientId: '',
    appointmentId: '',
    bedCharges: 0,
    emergencyCharges: 0,
    otherCharges: 0,
  });

  // Record Payment Modal
  const [selectedBillForPay, setSelectedBillForPay] = useState<Bill | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payError, setPayError] = useState('');

  async function loadBills() {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get<{ data: { bills: Bill[] } }>('/billing');
      setBills(res.data.data.bills || []);

      // Preload patients and appointments for bill generation
      api.get<{ data: { patients: PatientOption[] } }>('/patients').then((r) => {
        setPatients(r.data.data.patients || []);
      }).catch(() => {});

      api.get<{ data: { appointments: AppointmentOption[] } }>('/appointments').then((r) => {
        setAppointments(r.data.data.appointments || []);
      }).catch(() => {});
    } catch (requestError) {
      const response = (requestError as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Unable to load bills. Log in first.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}

    loadBills();
  }, []);

  async function handleGenerateBill(e: React.FormEvent) {
    e.preventDefault();
    setGenerateError('');

    if (!form.patientId) {
      setGenerateError('Please select a patient.');
      return;
    }

    const payload: any = {
      patientId: form.patientId,
      bedCharges: Number(form.bedCharges) || 0,
      emergencyCharges: Number(form.emergencyCharges) || 0,
      otherCharges: Number(form.otherCharges) || 0,
    };

    if (form.appointmentId) {
      payload.appointmentId = form.appointmentId;
    }

    try {
      setIsSubmitting(true);
      await api.post('/billing', payload);
      setSuccessMsg('Bill generated successfully.');
      setShowGenerateModal(false);
      setForm({
        patientId: '',
        appointmentId: '',
        bedCharges: 0,
        emergencyCharges: 0,
        otherCharges: 0,
      });
      await loadBills();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setGenerateError(response?.data?.message || 'Failed to generate bill.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    setPayError('');

    if (!selectedBillForPay || payAmount <= 0) {
      setPayError('Please enter a valid payment amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/billing/${selectedBillForPay._id}/pay`, { amount: Number(payAmount) });
      setSuccessMsg(`Payment of PKR ${payAmount.toLocaleString()} recorded.`);
      setSelectedBillForPay(null);
      setPayAmount(0);
      await loadBills();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setPayError(response?.data?.message || 'Payment recording failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  const totalBilled = bills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalPaid = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
  const totalOutstanding = bills.reduce((acc, b) => acc + (b.remainingAmount || 0), 0);

  return (
    <section className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
            <FileText size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
            <p className="text-sm text-gray-500">Track charges, consultation fees, and payments.</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setGenerateError('');
              setShowGenerateModal(true);
            }}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition"
          >
            <Plus size={18} /> Generate Bill
          </button>
        )}
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-500">Total Invoiced</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">PKR {totalBilled.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/60 shadow-sm">
          <p className="text-xs uppercase font-bold text-emerald-700">Total Collected</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">PKR {totalPaid.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-xl border border-rose-100 bg-rose-50/60 shadow-sm">
          <p className="text-xs uppercase font-bold text-rose-700">Outstanding Balance</p>
          <p className="mt-1 text-2xl font-bold text-rose-800">PKR {totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Bills Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading && <p className="p-8 text-center text-sm text-gray-500">Loading bills...</p>}

        {!isLoading && bills.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-300 mb-3" size={42} />
            <h2 className="text-base font-semibold text-gray-900">No bills generated yet</h2>
            <p className="mt-1 text-sm text-gray-500">Generated patient bills will appear here.</p>
          </div>
        )}

        {!isLoading && bills.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">Invoice #</th>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Breakdown</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Paid</th>
                  <th className="px-5 py-4">Remaining</th>
                  <th className="px-5 py-4">Status</th>
                  {isAdmin && <th className="px-5 py-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => {
                  const statusColors = {
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    'Partially Paid': 'bg-blue-50 text-blue-700 border-blue-200',
                    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  };

                  return (
                    <tr key={bill._id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 font-semibold text-gray-900">{bill.billId}</td>
                      <td className="px-5 py-4 text-gray-700">
                        <p className="font-medium text-gray-900">{bill.patient?.name || 'Patient'}</p>
                        {bill.patient?.patientId && (
                          <p className="text-xs text-gray-400">{bill.patient.patientId}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {bill.consultationFee > 0 && <span>Consult: PKR {bill.consultationFee} </span>}
                        {bill.bedCharges > 0 && <span>Bed: PKR {bill.bedCharges} </span>}
                        {bill.emergencyCharges > 0 && <span>Emr: PKR {bill.emergencyCharges} </span>}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-bold">
                        PKR {bill.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-emerald-700 font-semibold">
                        PKR {bill.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-rose-700 font-semibold">
                        PKR {bill.remainingAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            statusColors[bill.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-right">
                          {bill.status !== 'Paid' && (
                            <button
                              onClick={() => {
                                setSelectedBillForPay(bill);
                                setPayAmount(bill.remainingAmount);
                                setPayError('');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <CreditCard size={14} /> Pay
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Bill Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-cyan-600" size={20} /> Generate Patient Bill
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {generateError && (
              <p className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {generateError}
              </p>
            )}

            <form onSubmit={handleGenerateBill} className="space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Link Appointment (Optional - imports consultation fee)
                </label>
                <select
                  value={form.appointmentId}
                  onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-cyan-500"
                >
                  <option value="">-- None / Direct Charge --</option>
                  {appointments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.appointmentId} - {a.patient?.name} (Fee: PKR {a.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bed Charges (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.bedCharges}
                    onChange={(e) => setForm({ ...form, bedCharges: Number(e.target.value) })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.emergencyCharges}
                    onChange={(e) => setForm({ ...form, emergencyCharges: Number(e.target.value) })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Other (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.otherCharges}
                    onChange={(e) => setForm({ ...form, otherCharges: Number(e.target.value) })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedBillForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="text-emerald-600" size={20} /> Record Payment
              </h3>
              <button onClick={() => setSelectedBillForPay(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {payError && (
              <p className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {payError}
              </p>
            )}

            <div className="mb-4 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice:</span>
                <span className="font-semibold text-gray-900">{selectedBillForPay.billId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Patient:</span>
                <span className="font-semibold text-gray-900">{selectedBillForPay.patient?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Billed:</span>
                <span className="font-semibold text-gray-900">PKR {selectedBillForPay.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Already Paid:</span>
                <span className="font-semibold text-emerald-700">PKR {selectedBillForPay.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 text-sm font-bold">
                <span className="text-gray-700">Remaining Balance:</span>
                <span className="text-rose-600">PKR {selectedBillForPay.remainingAmount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Amount (PKR)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedBillForPay.remainingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedBillForPay(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
