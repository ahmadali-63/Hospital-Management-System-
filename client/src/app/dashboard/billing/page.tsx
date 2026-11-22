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

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  const totalBilled = bills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalPaid = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
  const totalOutstanding = bills.reduce((acc, b) => acc + (b.remainingAmount || 0), 0);

  return (
    <section className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <FileText size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Billing & Invoices</h1>
            <p className="text-sm text-slate-400 font-light">Track charges, consultation fees, and payments.</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setGenerateError('');
              setShowGenerateModal(true);
            }}
            className="glass-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-lg"
          >
            <Plus size={16} /> Generate Bill
          </button>
        )}
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card-interactive p-5 rounded-2xl border-white/10 shadow-lg">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Invoiced</p>
          <p className="mt-2 text-3xl font-black text-white">PKR {totalBilled.toLocaleString()}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-emerald-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Total Collected</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">PKR {totalPaid.toLocaleString()}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-rose-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-rose-400 tracking-wider">Outstanding Balance</p>
          <p className="mt-2 text-3xl font-black text-rose-300">PKR {totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Bills Table */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border-white/10">
        {isLoading && <p className="p-8 text-center text-sm text-slate-400">Loading bills...</p>}

        {!isLoading && bills.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-slate-500 mb-3" size={42} />
            <h2 className="text-base font-bold text-white">No bills generated yet</h2>
            <p className="mt-1 text-sm text-slate-400">Generated patient bills will appear here.</p>
          </div>
        )}

        {!isLoading && bills.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
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
              <tbody className="divide-y divide-white/5">
                {bills.map((bill) => {
                  const statusColors: Record<string, string> = {
                    Pending: 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]',
                    'Partially Paid': 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]',
                    Paid: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
                  };

                  return (
                    <tr key={bill._id} className="hover:bg-white/[0.04] transition">
                      <td className="px-5 py-4 font-mono font-bold text-white">{bill.billId}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{bill.patient?.name || 'Patient'}</p>
                        {bill.patient?.patientId && (
                          <p className="text-xs text-slate-400 font-mono">{bill.patient.patientId}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap font-mono text-xs">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300">
                        {bill.consultationFee > 0 && <div>Consult: PKR {bill.consultationFee}</div>}
                        {bill.bedCharges > 0 && <div>Bed: PKR {bill.bedCharges}</div>}
                        {bill.emergencyCharges > 0 && <div>Emr: PKR {bill.emergencyCharges}</div>}
                      </td>
                      <td className="px-5 py-4 text-white font-bold font-mono">
                        PKR {bill.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-emerald-300 font-semibold font-mono">
                        PKR {bill.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-rose-300 font-semibold font-mono">
                        PKR {bill.remainingAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                            statusColors[bill.status] || 'bg-slate-700/50 text-slate-200 border-slate-500/40'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border-white/15">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="text-cyan-400" size={20} /> Generate Patient Bill
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {generateError && (
              <p className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-medium">
                {generateError}
              </p>
            )}

            <form onSubmit={handleGenerateBill} className="space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link Appointment (Optional - imports consultation fee)
                </label>
                <select
                  value={form.appointmentId}
                  onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bed Charges (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.bedCharges}
                    onChange={(e) => setForm({ ...form, bedCharges: Number(e.target.value) })}
                    className="glass-input w-full text-sm rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.emergencyCharges}
                    onChange={(e) => setForm({ ...form, emergencyCharges: Number(e.target.value) })}
                    className="glass-input w-full text-sm rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Other (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.otherCharges}
                    onChange={(e) => setForm({ ...form, otherCharges: Number(e.target.value) })}
                    className="glass-input w-full text-sm rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-btn-primary px-5 py-2 text-xs font-bold text-slate-950 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-white/15">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="text-emerald-400" size={20} /> Record Payment
              </h3>
              <button onClick={() => setSelectedBillForPay(null)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {payError && (
              <p className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-medium">
                {payError}
              </p>
            )}

            <div className="mb-4 p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span className="font-mono font-bold text-white">{selectedBillForPay.billId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-semibold text-white">{selectedBillForPay.patient?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Billed:</span>
                <span className="font-bold text-white font-mono">PKR {selectedBillForPay.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Already Paid:</span>
                <span className="font-bold text-emerald-300 font-mono">PKR {selectedBillForPay.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold">
                <span className="text-slate-200">Remaining Balance:</span>
                <span className="text-rose-300 font-mono">PKR {selectedBillForPay.remainingAmount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Amount (PKR)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedBillForPay.remainingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedBillForPay(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-400 hover:to-teal-500 transition shadow-[0_0_15px_rgba(16,185,129,0.35)] disabled:opacity-50 cursor-pointer"
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
