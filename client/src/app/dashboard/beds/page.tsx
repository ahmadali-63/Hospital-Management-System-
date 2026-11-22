'use client';

import { useEffect, useState, useMemo } from 'react';
import { AxiosError } from 'axios';
import { Bed as BedIcon, Plus, LogOut, Filter, X } from 'lucide-react';
import api from '@/services/api';

type Ward = {
  _id: string;
  name: string;
  type: string;
};

type Bed = {
  _id: string;
  bedNumber: string;
  type: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  ward?: { _id: string; name: string };
  currentPatient?: { _id: string; name: string; patientId: string };
};

type Admission = {
  _id: string;
  admissionId: string;
  patient?: { _id: string; name: string; patientId: string };
  doctor?: { _id: string; name: string };
  ward?: { _id: string; name: string };
  bed?: { _id: string; bedNumber: string };
  admissionDate: string;
  reason: string;
  status: 'Active' | 'Completed';
};

type PatientOption = {
  _id: string;
  name: string;
  patientId: string;
};

type DoctorOption = {
  _id: string;
  name: string;
  specialization: string;
};

export default function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [admitForm, setAdmitForm] = useState({
    patientId: '',
    doctorId: '',
    wardId: '',
    bedId: '',
    reason: '',
  });

  async function loadData() {
    try {
      setIsLoading(true);
      setError('');

      const [bedsRes, wardsRes, admissionsRes] = await Promise.all([
        api.get<{ data: { beds: Bed[] } }>('/beds'),
        api.get<{ data: { wards: Ward[] } }>('/beds/wards').catch(() => ({ data: { data: { wards: [] } } })),
        api.get<{ data: { admissions: Admission[] } }>('/beds/admissions').catch(() => ({ data: { data: { admissions: [] } } })),
      ]);

      setBeds(bedsRes.data.data.beds || []);
      setWards(wardsRes.data.data.wards || []);
      setAdmissions(admissionsRes.data.data.admissions || []);

      // Preload patients and doctors for the admission form
      api.get<{ data: { patients: PatientOption[] } }>('/patients').then((res) => {
        setPatients(res.data.data.patients || []);
      }).catch(() => {});

      api.get<{ data: { doctors: DoctorOption[] } }>('/doctors').then((res) => {
        setDoctors(res.data.data.doctors || []);
      }).catch(() => {});

    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Failed to load bed information. Please log in.');
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

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const matchWard = selectedWard === 'ALL' || bed.ward?._id === selectedWard;
      const matchStatus = selectedStatus === 'ALL' || bed.status === selectedStatus;
      return matchWard && matchStatus;
    });
  }, [beds, selectedWard, selectedStatus]);

  const availableBedsForWard = useMemo(() => {
    if (!admitForm.wardId) return beds.filter((b) => b.status === 'Available');
    return beds.filter((b) => b.ward?._id === admitForm.wardId && b.status === 'Available');
  }, [beds, admitForm.wardId]);

  async function handleAdmitPatient(e: React.FormEvent) {
    e.preventDefault();
    setModalError('');

    if (!admitForm.patientId || !admitForm.doctorId || !admitForm.wardId || !admitForm.bedId || !admitForm.reason) {
      setModalError('Please fill out all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/beds/admissions', admitForm);
      setSuccessMsg('Patient admitted successfully.');
      setShowAdmitModal(false);
      setAdmitForm({ patientId: '', doctorId: '', wardId: '', bedId: '', reason: '' });
      await loadData();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setModalError(response?.data?.message || 'Admission failed. Make sure all IDs are valid.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDischarge(admissionId: string) {
    if (!confirm('Are you sure you want to discharge this patient?')) return;
    try {
      await api.patch(`/beds/admissions/${admissionId}/discharge`);
      setSuccessMsg('Patient discharged successfully and bed released.');
      await loadData();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Discharge failed.');
    }
  }

  const totalBedsCount = beds.length;
  const availableBedsCount = beds.filter((b) => b.status === 'Available').length;
  const occupiedBedsCount = beds.filter((b) => b.status === 'Occupied').length;
  const icuBedsCount = beds.filter((b) => b.type === 'ICU').length;

  return (
    <section className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <BedIcon size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Bed Management</h1>
              <p className="text-sm text-slate-400 font-light">Monitor ward capacity, assign beds, and manage discharges.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setShowAdmitModal(true);
          }}
          className="glass-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-lg"
        >
          <Plus size={16} /> Admit Patient
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
        <div className="glass-card-interactive p-5 rounded-2xl border-white/10 shadow-lg">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Capacity</p>
          <p className="mt-2 text-3xl font-black text-white">{totalBedsCount}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-emerald-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Available Beds</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{availableBedsCount}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-rose-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-rose-400 tracking-wider">Occupied Beds</p>
          <p className="mt-2 text-3xl font-black text-rose-300">{occupiedBedsCount}</p>
        </div>
        <div className="glass-card-interactive p-5 rounded-2xl border-purple-400/30 shadow-lg">
          <p className="text-xs uppercase font-bold text-purple-400 tracking-wider">ICU Capacity</p>
          <p className="mt-2 text-3xl font-black text-purple-300">{icuBedsCount}</p>
        </div>
      </div>

      {/* Active Admissions Section */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border-white/10">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Active Admissions</h2>
            <p className="text-xs text-slate-400">Currently admitted in-patients</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
            {admissions.filter((a) => a.status === 'Active').length} Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Admission ID</th>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Attending Doctor</th>
                <th className="px-5 py-4">Ward & Bed</th>
                <th className="px-5 py-4">Admission Date</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admissions.filter((a) => a.status === 'Active').length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-400">
                    No active admissions at this moment.
                  </td>
                </tr>
              ) : (
                admissions
                  .filter((a) => a.status === 'Active')
                  .map((adm) => (
                    <tr key={adm._id} className="hover:bg-white/[0.04] transition">
                      <td className="px-5 py-4 font-mono font-bold text-white">{adm.admissionId}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{adm.patient?.name || 'Patient'}</p>
                        <p className="text-xs text-slate-400 font-mono">{adm.patient?.patientId}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{adm.doctor?.name || 'Assigned Doctor'}</td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-200">{adm.ward?.name}</span>
                        <span className="ml-2 text-xs text-cyan-300 font-mono font-bold glass-pill px-2.5 py-0.5 rounded-lg border border-cyan-400/30">
                          {adm.bed?.bedNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap font-mono text-xs">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-slate-300 max-w-xs truncate">{adm.reason}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDischarge(adm._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-400/30 transition cursor-pointer"
                        >
                          <LogOut size={14} /> Discharge
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bed Grid & Filter Section */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden p-6 border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">Hospital Beds Status</h2>
            <p className="text-xs text-slate-400">Real-time status of all hospital beds by ward</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Filter size={14} className="text-cyan-400" />
              <span>Filter:</span>
            </div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="glass-pill text-xs font-semibold rounded-xl px-3.5 py-2 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900 border border-white/10"
            >
              <option value="ALL">All Wards</option>
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glass-pill text-xs font-semibold rounded-xl px-3.5 py-2 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900 border border-white/10"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center py-12 text-sm text-slate-400">Loading beds...</p>
        ) : filteredBeds.length === 0 ? (
          <p className="text-center py-12 text-sm text-slate-400">No beds match your filter.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBeds.map((bed) => {
              const isAvailable = bed.status === 'Available';
              const isOccupied = bed.status === 'Occupied';
              const isReserved = bed.status === 'Reserved';

              const bedBorder = isAvailable
                ? 'border-emerald-400/35 hover:border-emerald-400/60'
                : isOccupied
                ? 'border-rose-400/35 hover:border-rose-400/60'
                : isReserved
                ? 'border-amber-400/35 hover:border-amber-400/60'
                : 'border-slate-500/35';

              const badgeColor = isAvailable
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                : isOccupied
                ? 'bg-rose-500/25 text-rose-300 border-rose-400/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                : isReserved
                ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                : 'bg-slate-600/30 text-slate-300 border-slate-500/40';

              return (
                <div
                  key={bed._id}
                  className={`glass-card-interactive p-4 rounded-2xl border transition shadow-md ${bedBorder}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-white text-sm">{bed.bedNumber}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${badgeColor}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {bed.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{bed.ward?.name || 'General Ward'}</p>
                  <p className="text-[11px] font-semibold text-cyan-300 mt-0.5">{bed.type} Bed</p>
                  {bed.currentPatient && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-xs">
                      <p className="font-semibold text-white truncate">{bed.currentPatient.name}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admit Patient Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border-white/15">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BedIcon className="text-cyan-400" size={20} /> Admit Patient to Bed
              </h3>
              <button onClick={() => setShowAdmitModal(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <p className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-medium">
                {modalError}
              </p>
            )}

            <form onSubmit={handleAdmitPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Patient</label>
                <select
                  value={admitForm.patientId}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attending Doctor</label>
                <select
                  value={admitForm.doctorId}
                  onChange={(e) => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ward</label>
                  <select
                    value={admitForm.wardId}
                    onChange={(e) => setAdmitForm({ ...admitForm, wardId: e.target.value, bedId: '' })}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                    required
                  >
                    <option value="">-- Select Ward --</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Available Bed</label>
                  <select
                    value={admitForm.bedId}
                    onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                    className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
                    required
                  >
                    <option value="">-- Select Bed --</option>
                    {availableBedsForWard.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bedNumber} ({b.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Admission</label>
                <textarea
                  value={admitForm.reason}
                  onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                  placeholder="Clinical reason for admission..."
                  rows={3}
                  className="glass-input w-full text-sm rounded-xl px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-btn-primary px-5 py-2 text-xs font-bold text-slate-950 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {isSubmitting ? 'Admitting...' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
