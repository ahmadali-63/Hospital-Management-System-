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
    <section className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <BedIcon size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bed Management</h1>
              <p className="text-sm text-gray-500">Monitor ward capacity, assign beds, and manage discharges.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setShowAdmitModal(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition"
        >
          <Plus size={18} /> Admit Patient
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
        <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400">Total Capacity</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalBedsCount}</p>
        </div>
        <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/50 shadow-sm">
          <p className="text-xs uppercase font-bold text-emerald-600">Available Beds</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{availableBedsCount}</p>
        </div>
        <div className="p-5 rounded-xl border border-rose-100 bg-rose-50/50 shadow-sm">
          <p className="text-xs uppercase font-bold text-rose-600">Occupied Beds</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{occupiedBedsCount}</p>
        </div>
        <div className="p-5 rounded-xl border border-purple-100 bg-purple-50/50 shadow-sm">
          <p className="text-xs uppercase font-bold text-purple-600">ICU Capacity</p>
          <p className="mt-1 text-2xl font-bold text-purple-700">{icuBedsCount}</p>
        </div>
      </div>

      {/* Active Admissions Section */}
      <div className="mb-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Admissions</h2>
            <p className="text-xs text-gray-500">Currently admitted in-patients</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-cyan-100 text-cyan-800">
            {admissions.filter((a) => a.status === 'Active').length} Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Admission ID</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Attending Doctor</th>
                <th className="px-5 py-3">Ward & Bed</th>
                <th className="px-5 py-3">Admission Date</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admissions.filter((a) => a.status === 'Active').length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                    No active admissions at this moment.
                  </td>
                </tr>
              ) : (
                admissions
                  .filter((a) => a.status === 'Active')
                  .map((adm) => (
                    <tr key={adm._id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4 font-semibold text-gray-900">{adm.admissionId}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{adm.patient?.name || 'Patient'}</p>
                        <p className="text-xs text-gray-400">{adm.patient?.patientId}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">{adm.doctor?.name || 'Assigned Doctor'}</td>
                      <td className="px-5 py-4 text-gray-700">
                        <span className="font-medium">{adm.ward?.name}</span>
                        <span className="ml-2 text-xs text-cyan-700 font-semibold bg-cyan-50 px-2 py-0.5 rounded">
                          {adm.bed?.bedNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{adm.reason}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDischarge(adm._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hospital Beds Status</h2>
            <p className="text-xs text-gray-500">Real-time status of all hospital beds by ward</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>Filter:</span>
            </div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-cyan-500"
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
              className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-cyan-500"
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
          <p className="text-center py-12 text-sm text-gray-500">Loading beds...</p>
        ) : filteredBeds.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-500">No beds match your filter.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBeds.map((bed) => {
              const isAvailable = bed.status === 'Available';
              return (
                <div
                  key={bed._id}
                  className={`p-4 rounded-xl border transition ${
                    isAvailable
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-sm">{bed.bedNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{bed.ward?.name || 'General Ward'}</p>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{bed.type} Bed</p>
                  {bed.currentPatient && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                      <p className="font-medium text-gray-800 truncate">{bed.currentPatient.name}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Admit Patient to Bed</h3>
              <button onClick={() => setShowAdmitModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <p className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </p>
            )}

            <form onSubmit={handleAdmitPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Patient</label>
                <select
                  value={admitForm.patientId}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Attending Doctor</label>
                <select
                  value={admitForm.doctorId}
                  onChange={(e) => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-cyan-500"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ward</label>
                  <select
                    value={admitForm.wardId}
                    onChange={(e) => setAdmitForm({ ...admitForm, wardId: e.target.value, bedId: '' })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-cyan-500"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Available Bed</label>
                  <select
                    value={admitForm.bedId}
                    onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-cyan-500"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Admission</label>
                <textarea
                  value={admitForm.reason}
                  onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                  placeholder="Clinical reason for admission..."
                  rows={3}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition disabled:opacity-50"
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
