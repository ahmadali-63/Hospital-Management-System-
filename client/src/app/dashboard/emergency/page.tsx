'use client';

import { useEffect, useState, useMemo } from 'react';
import { AxiosError } from 'axios';
import { Siren, Plus, AlertTriangle, Clock, User, X } from 'lucide-react';
import api from '@/services/api';

type EmergencyCase = {
  _id: string;
  caseId: string;
  patientName: string;
  emergencyType: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  symptoms: string[];
  arrivalTime: string;
  doctor?: { _id: string; name: string };
  bed?: { _id: string; bedNumber: string };
  status: 'Waiting' | 'Under Treatment' | 'Admitted' | 'Discharged' | 'Completed';
};

type DoctorOption = {
  _id: string;
  name: string;
  specialization: string;
};

type BedOption = {
  _id: string;
  bedNumber: string;
  type: string;
  status: string;
};

type EmergencyPayload = {
  patientName: string;
  emergencyType: string;
  priority: EmergencyCase['priority'];
  symptoms: string[];
  doctorId?: string;
  bedId?: string;
};

export default function EmergencyPage() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [availableBeds, setAvailableBeds] = useState<BedOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    patientName: '',
    emergencyType: '',
    priority: 'High' as 'Critical' | 'High' | 'Medium' | 'Low',
    symptomsInput: '',
    doctorId: '',
    bedId: '',
  });

  async function loadData() {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get<{ data: { cases: EmergencyCase[] } }>('/emergency');
      setCases(res.data.data.cases || []);

      // Preload available doctors and emergency beds
      api.get<{ data: { doctors: DoctorOption[] } }>('/doctors').then((r) => {
        setDoctors(r.data.data.doctors || []);
      }).catch(() => {});

      api.get<{ data: { beds: BedOption[] } }>('/beds?status=Available').then((r) => {
        setAvailableBeds(r.data.data.beds || []);
      }).catch(() => {});
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Unable to load emergency cases.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchP = selectedPriority === 'ALL' || c.priority === selectedPriority;
      const matchS = selectedStatus === 'ALL' || c.status === selectedStatus;
      return matchP && matchS;
    });
  }, [cases, selectedPriority, selectedStatus]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setModalError('');

    if (!form.patientName.trim() || !form.emergencyType.trim()) {
      setModalError('Patient name and emergency type are required.');
      return;
    }

    const symptoms = form.symptomsInput
      ? form.symptomsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload: EmergencyPayload = {
      patientName: form.patientName.trim(),
      emergencyType: form.emergencyType.trim(),
      priority: form.priority,
      symptoms,
    };

    if (form.doctorId) payload.doctorId = form.doctorId;
    if (form.bedId) payload.bedId = form.bedId;

    try {
      setIsSubmitting(true);
      await api.post('/emergency', payload);
      setSuccessMsg('Emergency case registered successfully.');
      setShowModal(false);
      setForm({
        patientName: '',
        emergencyType: '',
        priority: 'High',
        symptomsInput: '',
        doctorId: '',
        bedId: '',
      });
      await loadData();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setModalError(response?.data?.message || 'Failed to register emergency case.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const criticalCount = cases.filter((c) => c.priority === 'Critical').length;
  const highCount = cases.filter((c) => c.priority === 'High').length;
  const waitingCount = cases.filter((c) => c.status === 'Waiting').length;
  const activeCount = cases.filter((c) => c.status === 'Under Treatment' || c.status === 'Admitted').length;

  return (
    <section className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Siren size={24} className="animate-pulse" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Emergency Ward</h1>
            <p className="text-sm text-slate-400 font-light">Triage, priority tracking, and emergency admission intake.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.35)] transition cursor-pointer"
        >
          <Plus size={16} /> Register Emergency Case
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card-interactive p-5 rounded-2xl border-rose-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-rose-400 flex items-center gap-1.5 tracking-wider">
            <AlertTriangle size={15} /> Critical Cases
          </p>
          <p className="mt-2 text-3xl font-black text-white">{criticalCount}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-amber-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-amber-400 tracking-wider">High Priority</p>
          <p className="mt-2 text-3xl font-black text-white">{highCount}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-cyan-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Under Care</p>
          <p className="mt-2 text-3xl font-black text-white">{activeCount}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-white/10 shadow-lg">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Waiting for Doctor</p>
          <p className="mt-2 text-3xl font-black text-white">{waitingCount}</p>
        </div>
      </div>

      {/* Filter and Cases Table */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border-white/10">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Registered Emergency Cases</h2>
            <p className="text-xs text-slate-400">Live triage feed ordered by arrival</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="glass-pill text-xs font-semibold rounded-xl px-3.5 py-2 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900 border border-white/10"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glass-pill text-xs font-semibold rounded-xl px-3.5 py-2 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900 border border-white/10"
            >
              <option value="ALL">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="bg-white/[0.04] border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Case ID</th>
                <th className="px-5 py-4">Patient Name</th>
                <th className="px-5 py-4">Emergency Type</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Arrival Time</th>
                <th className="px-5 py-4">Assigned Doctor</th>
                <th className="px-5 py-4">Bed</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">
                    Loading emergency records...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    No emergency cases match the criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const priorityColors = {
                    Critical: 'bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse',
                    High: 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
                    Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
                    Low: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
                  };

                  return (
                    <tr key={c._id} className="hover:bg-white/[0.04] transition">
                      <td className="px-5 py-4 font-mono font-bold text-white">{c.caseId}</td>
                      <td className="px-5 py-4 font-bold text-white">{c.patientName}</td>
                      <td className="px-5 py-4 text-slate-300">
                        <p className="font-semibold text-white">{c.emergencyType}</p>
                        {c.symptoms && c.symptoms.length > 0 && (
                          <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                            {c.symptoms.join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            priorityColors[c.priority] || 'bg-slate-500/20 text-slate-300 border-slate-400/30'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <Clock size={13} className="text-cyan-400" />
                          {new Date(c.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="text-slate-500 text-[11px]">
                            ({new Date(c.arrivalTime).toLocaleDateString()})
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {c.doctor?.name ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                            <User size={13} className="text-cyan-400" /> {c.doctor.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {c.bed?.bedNumber ? (
                          <span className="glass-pill text-xs font-mono font-bold px-2.5 py-1 text-cyan-300 border border-cyan-400/30 rounded-lg">
                            {c.bed.bedNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-bold px-3.5 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-sm ${
                            c.status === 'Waiting'
                              ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                              : c.status === 'Under Treatment'
                              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.35)] animate-pulse'
                              : c.status === 'Admitted'
                              ? 'bg-purple-500/25 text-purple-300 border-purple-400/50 shadow-[0_0_12px_rgba(192,132,252,0.35)]'
                              : c.status === 'Discharged'
                              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                              : c.status === 'Completed'
                              ? 'bg-blue-500/25 text-blue-300 border-blue-400/50 shadow-[0_0_12px_rgba(96,165,250,0.35)]'
                              : 'bg-slate-700/50 text-slate-200 border-slate-500/40'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border-white/15">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Siren className="text-rose-400 animate-pulse" size={20} /> Register Emergency Case
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

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Type</label>
                  <input
                    type="text"
                    value={form.emergencyType}
                    onChange={(e) => setForm({ ...form, emergencyType: e.target.value })}
                    placeholder="e.g. Acute Trauma / Cardiac"
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Triage Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => {
                      const priority = e.target.value;
                      if (priority === 'Critical' || priority === 'High' || priority === 'Medium' || priority === 'Low') {
                        setForm({ ...form, priority });
                      }
                    }}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                  >
                    <option value="Critical">Critical (Immediate)</option>
                    <option value="High">High (Urgent)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Symptoms (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.symptomsInput}
                  onChange={(e) => setForm({ ...form, symptomsInput: e.target.value })}
                  placeholder="Severe chest pain, Dyspnea, Diaphoresis"
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Doctor (Optional)</label>
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                  >
                    <option value="">-- None --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Bed (Optional)</label>
                  <select
                    value={form.bedId}
                    onChange={(e) => setForm({ ...form, bedId: e.target.value })}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                  >
                    <option value="">-- None --</option>
                    {availableBeds.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bedNumber} ({b.type})
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-400 hover:to-pink-500 transition shadow-[0_0_15px_rgba(244,63,94,0.35)] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
