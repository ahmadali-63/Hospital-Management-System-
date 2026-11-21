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
    <section className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
            <Siren size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Ward</h1>
            <p className="text-sm text-gray-500">Triage, priority tracking, and emergency admission intake.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
        >
          <Plus size={18} /> Register Emergency Case
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/60 shadow-sm">
          <p className="text-xs uppercase font-bold text-rose-700 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Critical Cases
          </p>
          <p className="mt-1 text-2xl font-bold text-rose-900">{criticalCount}</p>
        </div>
        <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 shadow-sm">
          <p className="text-xs uppercase font-bold text-amber-700">High Priority</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{highCount}</p>
        </div>
        <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/60 shadow-sm">
          <p className="text-xs uppercase font-bold text-blue-700">Under Care</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">{activeCount}</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-500">Waiting for Doctor</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{waitingCount}</p>
        </div>
      </div>

      {/* Filter and Cases Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Registered Emergency Cases</h2>
            <p className="text-xs text-gray-500">Live triage feed ordered by arrival</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-cyan-500"
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
              className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-cyan-500"
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
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Case ID</th>
                <th className="px-5 py-3">Patient Name</th>
                <th className="px-5 py-3">Emergency Type</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Arrival Time</th>
                <th className="px-5 py-3">Assigned Doctor</th>
                <th className="px-5 py-3">Bed</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">
                    Loading emergency records...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">
                    No emergency cases match the criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const priorityColors = {
                    Critical: 'bg-rose-100 text-rose-800 border-rose-300',
                    High: 'bg-amber-100 text-amber-800 border-amber-300',
                    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    Low: 'bg-blue-100 text-blue-800 border-blue-300',
                  };

                  return (
                    <tr key={c._id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4 font-semibold text-gray-900">{c.caseId}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{c.patientName}</td>
                      <td className="px-5 py-4 text-gray-700">
                        <p className="font-medium">{c.emergencyType}</p>
                        {c.symptoms && c.symptoms.length > 0 && (
                          <p className="text-xs text-gray-400 truncate max-w-xs">
                            {c.symptoms.join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            priorityColors[c.priority] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock size={13} className="text-gray-400" />
                          {new Date(c.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="text-gray-400 text-[11px]">
                            ({new Date(c.arrivalTime).toLocaleDateString()})
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {c.doctor?.name ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-900">
                            <User size={13} className="text-gray-400" /> {c.doctor.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {c.bed?.bedNumber ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700">
                            {c.bed.bedNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Siren className="text-rose-600" size={20} /> Register Emergency Case
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

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Type</label>
                  <input
                    type="text"
                    value={form.emergencyType}
                    onChange={(e) => setForm({ ...form, emergencyType: e.target.value })}
                    placeholder="e.g. Acute Trauma / Cardiac"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Triage Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => {
                      const priority = e.target.value;
                      if (priority === 'Critical' || priority === 'High' || priority === 'Medium' || priority === 'Low') {
                        setForm({ ...form, priority });
                      }
                    }}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  >
                    <option value="Critical">Critical (Immediate)</option>
                    <option value="High">High (Urgent)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Symptoms (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.symptomsInput}
                  onChange={(e) => setForm({ ...form, symptomsInput: e.target.value })}
                  placeholder="Severe chest pain, Dyspnea, Diaphoresis"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Doctor (Optional)</label>
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Bed (Optional)</label>
                  <select
                    value={form.bedId}
                    onChange={(e) => setForm({ ...form, bedId: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
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
                  className="px-5 py-2 text-sm font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
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
