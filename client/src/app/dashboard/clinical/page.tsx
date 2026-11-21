'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { ClipboardList, Pill, Plus, Calendar, Trash2, X } from 'lucide-react';
import api from '@/services/api';

type MedicalRecord = {
  _id: string;
  patient?: { _id: string; name: string; patientId?: string };
  doctor?: { _id: string; name: string; specialization?: string };
  appointment?: { _id: string; appointmentId?: string };
  symptoms: string[];
  diagnosis: string[];
  treatment: string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
};

type Medicine = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

type Prescription = {
  _id: string;
  patient?: { _id: string; name: string; patientId?: string };
  doctor?: { _id: string; name: string; specialization?: string };
  appointment?: { _id: string; appointmentId?: string };
  medicines: Medicine[];
  createdAt: string;
};

type AppointmentOption = {
  _id: string;
  appointmentId: string;
  date: string;
  patient?: { _id: string; name: string };
  doctor?: { _id: string; name: string };
};

type UserInfo = {
  role?: string;
};

export default function ClinicalPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions'>('records');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Record Form
  const [recordForm, setRecordForm] = useState({
    appointmentId: '',
    symptomsInput: '',
    diagnosisInput: '',
    treatment: '',
    notes: '',
    followUpDate: '',
  });

  // Add Prescription Form
  const [prescriptionAppointmentId, setPrescriptionAppointmentId] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}

    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError('');

      const [recordsRes, prescriptionsRes, apptsRes] = await Promise.all([
        api.get<{ data: { records: MedicalRecord[] } }>('/clinical/records').catch(() => ({ data: { data: { records: [] } } })),
        api.get<{ data: { prescriptions: Prescription[] } }>('/clinical/prescriptions').catch(() => ({ data: { data: { prescriptions: [] } } })),
        api.get<{ data: { appointments: AppointmentOption[] } }>('/appointments').catch(() => ({ data: { data: { appointments: [] } } })),
      ]);

      setRecords(recordsRes.data.data.records || []);
      setPrescriptions(prescriptionsRes.data.data.prescriptions || []);
      setAppointments(apptsRes.data.data.appointments || []);
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setError(response?.data?.message || 'Failed to load clinical records.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    setModalError('');

    if (!recordForm.appointmentId || !recordForm.symptomsInput || !recordForm.diagnosisInput || !recordForm.treatment) {
      setModalError('Please fill out all required clinical fields.');
      return;
    }

    const symptoms = recordForm.symptomsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const diagnosis = recordForm.diagnosisInput.split(',').map((d) => d.trim()).filter(Boolean);

    try {
      setIsSubmitting(true);
      await api.post('/clinical/records', {
        appointmentId: recordForm.appointmentId,
        symptoms,
        diagnosis,
        treatment: recordForm.treatment,
        notes: recordForm.notes || undefined,
        followUpDate: recordForm.followUpDate || undefined,
      });

      setSuccessMsg('Medical record created successfully.');
      setShowRecordModal(false);
      setRecordForm({ appointmentId: '', symptomsInput: '', diagnosisInput: '', treatment: '', notes: '', followUpDate: '' });
      await loadData();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setModalError(response?.data?.message || 'Failed to create medical record. Only doctors can add records.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function addMedicineRow() {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  }

  function removeMedicineRow(index: number) {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  }

  function updateMedicine(index: number, field: keyof Medicine, value: string) {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  }

  async function handleCreatePrescription(e: React.FormEvent) {
    e.preventDefault();
    setModalError('');

    if (!prescriptionAppointmentId) {
      setModalError('Please select an appointment.');
      return;
    }

    for (const med of medicines) {
      if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()) {
        setModalError('Please fill in medicine name, dosage, frequency, and duration for all items.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await api.post('/clinical/prescriptions', {
        appointmentId: prescriptionAppointmentId,
        medicines,
      });

      setSuccessMsg('Prescription issued successfully.');
      setShowPrescriptionModal(false);
      setPrescriptionAppointmentId('');
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      await loadData();
    } catch (err) {
      const response = (err as AxiosError<{ message?: string }>).response;
      setModalError(response?.data?.message || 'Failed to create prescription. Only doctors can issue prescriptions.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDoctor = currentUser?.role === 'DOCTOR' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <section className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
            <ClipboardList size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinical Workflows</h1>
            <p className="text-sm text-gray-500">Electronic health records, diagnosis tracking, and e-prescriptions.</p>
          </div>
        </div>

        {isDoctor && (
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={() => {
                setModalError('');
                setShowRecordModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl hover:bg-cyan-700 transition"
            >
              <Plus size={16} /> Add Medical Record
            </button>
            <button
              onClick={() => {
                setModalError('');
                setShowPrescriptionModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition"
            >
              <Pill size={16} /> Write Prescription
            </button>
          </div>
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

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'records'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={18} /> Medical Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'prescriptions'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Pill size={18} /> Prescriptions ({prescriptions.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-center py-12 text-sm text-gray-500">Loading clinical data...</p>
      ) : activeTab === 'records' ? (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <ClipboardList className="mx-auto text-gray-300 mb-3" size={40} />
              <h3 className="font-semibold text-gray-800">No medical records found</h3>
              <p className="text-sm text-gray-500 mt-1">Medical records documented after appointments will appear here.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">
                      {rec.patient?.name ? rec.patient.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{rec.patient?.name || 'Patient'}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Attending: {rec.doctor?.name || 'Doctor'}</span>
                        {rec.doctor?.specialization && <span>• {rec.doctor.specialization}</span>}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Symptoms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.symptoms.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Diagnosis</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.diagnosis.map((d, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Treatment Plan</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs leading-relaxed">
                      {rec.treatment}
                    </p>
                  </div>

                  {rec.notes && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-1">Doctor&apos;s Notes</p>
                      <p className="text-gray-600 text-xs italic">{rec.notes}</p>
                    </div>
                  )}

                  {rec.followUpDate && (
                    <div className="md:col-span-2 text-xs text-cyan-700 font-semibold flex items-center gap-1.5">
                      <Calendar size={14} /> Recommended Follow-up: {new Date(rec.followUpDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Pill className="mx-auto text-gray-300 mb-3" size={40} />
              <h3 className="font-semibold text-gray-800">No prescriptions found</h3>
              <p className="text-sm text-gray-500 mt-1">Prescriptions written by doctors will be listed here.</p>
            </div>
          ) : (
            prescriptions.map((pres) => (
              <div key={pres._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      <Pill size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Rx for {pres.patient?.name || 'Patient'}</h3>
                      <p className="text-xs text-gray-500">
                        Prescribed by {pres.doctor?.name || 'Doctor'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(pres.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase border-b border-gray-100">
                      <tr>
                        <th className="px-3 py-2">Medicine</th>
                        <th className="px-3 py-2">Dosage</th>
                        <th className="px-3 py-2">Frequency</th>
                        <th className="px-3 py-2">Duration</th>
                        <th className="px-3 py-2">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pres.medicines.map((m, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2.5 font-bold text-gray-900">{m.name}</td>
                          <td className="px-3 py-2.5 text-gray-700">{m.dosage}</td>
                          <td className="px-3 py-2.5 text-gray-700">{m.frequency}</td>
                          <td className="px-3 py-2.5 text-gray-700">{m.duration}</td>
                          <td className="px-3 py-2.5 text-gray-500">{m.instructions || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Medical Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="text-cyan-600" size={20} /> Add Medical Record
              </h3>
              <button onClick={() => setShowRecordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <p className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </p>
            )}

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Appointment</label>
                <select
                  value={recordForm.appointmentId}
                  onChange={(e) => setRecordForm({ ...recordForm, appointmentId: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">-- Choose Appointment --</option>
                  {appointments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.appointmentId} - {a.patient?.name || 'Patient'} ({new Date(a.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Symptoms (comma-separated)</label>
                <input
                  type="text"
                  value={recordForm.symptomsInput}
                  onChange={(e) => setRecordForm({ ...recordForm, symptomsInput: e.target.value })}
                  placeholder="Fever, Sore throat, Cough"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Diagnosis (comma-separated)</label>
                <input
                  type="text"
                  value={recordForm.diagnosisInput}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosisInput: e.target.value })}
                  placeholder="Upper respiratory tract infection"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Treatment Plan</label>
                <textarea
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                  placeholder="Prescribed rest, hydration, and medication."
                  rows={3}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={recordForm.followUpDate}
                    onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    placeholder="General remarks..."
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pill className="text-purple-600" size={20} /> Write Prescription
              </h3>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <p className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </p>
            )}

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Appointment</label>
                <select
                  value={prescriptionAppointmentId}
                  onChange={(e) => setPrescriptionAppointmentId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-purple-500"
                  required
                >
                  <option value="">-- Choose Appointment --</option>
                  {appointments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.appointmentId} - {a.patient?.name || 'Patient'} ({new Date(a.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">Prescribed Medicines</label>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Medicine #{idx + 1}</span>
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-purple-500"
                          required
                        />
                        <input
                          placeholder="Dosage (e.g. 500mg)"
                          value={med.dosage}
                          onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-purple-500"
                          required
                        />
                        <input
                          placeholder="Frequency (e.g. 1-0-1)"
                          value={med.frequency}
                          onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-purple-500"
                          required
                        />
                        <input
                          placeholder="Duration (e.g. 5 days)"
                          value={med.duration}
                          onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-purple-500"
                          required
                        />
                      </div>
                      <input
                        placeholder="Instructions (e.g. Take after meal)"
                        value={med.instructions}
                        onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
