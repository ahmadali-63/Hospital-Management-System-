import MedicalRecord, { IMedicalRecord } from '../models/MedicalRecord';
import Prescription, { IPrescription } from '../models/Prescription';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { Role } from '../models/User';

export class ClinicalService {
  static async addMedicalRecord(data: any, user: any): Promise<IMedicalRecord> {
    const { appointmentId, symptoms, diagnosis, treatment, notes, followUpDate } = data;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      throw Object.assign(new Error('Not authorized to add records to this appointment'), { statusCode: 403 });
    }

    const record = await MedicalRecord.create({
      patient: appointment.patient,
      doctor: doctor._id,
      appointment: appointment._id,
      symptoms,
      diagnosis,
      treatment,
      notes,
      followUpDate,
    });

    return record;
  }

  static async getMedicalRecords(patientId: string, user: any): Promise<IMedicalRecord[]> {
    if (user.role === Role.PATIENT) {
      const patient = await Patient.findOne({ user: user._id });
      if (patient?._id.toString() !== patientId) {
        throw Object.assign(new Error('Not authorized to view these records'), { statusCode: 403 });
      }
    } else if (user.role === Role.DOCTOR) {
      // Allow doctor to view records if assigned
    }
    
    return MedicalRecord.find({ patient: patientId })
      .populate('doctor')
      .populate('appointment')
      .sort('-createdAt')
      .exec();
  }

  static async createPrescription(data: any, user: any): Promise<IPrescription> {
    const { appointmentId, medicines } = data;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      throw Object.assign(new Error('Not authorized to add prescription to this appointment'), { statusCode: 403 });
    }

    const prescription = await Prescription.create({
      patient: appointment.patient,
      doctor: doctor._id,
      appointment: appointment._id,
      medicines,
    });

    return prescription;
  }

  static async getPrescriptions(patientId: string, user: any): Promise<IPrescription[]> {
    if (user.role === Role.PATIENT) {
      const patient = await Patient.findOne({ user: user._id });
      if (patient?._id.toString() !== patientId) {
        throw Object.assign(new Error('Not authorized to view these prescriptions'), { statusCode: 403 });
      }
    }

    return Prescription.find({ patient: patientId })
      .populate('doctor')
      .populate('appointment')
      .sort('-createdAt')
      .exec();
  }
}
