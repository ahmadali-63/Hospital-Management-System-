import Patient, { IPatient } from '../models/Patient';
import User from '../models/User';

export class PatientService {
  static async getPatients(query: any): Promise<IPatient[]> {
    const filter: any = {};
    if (query.patientId) filter.patientId = { $regex: query.patientId, $options: 'i' };
    if (query.name) filter.name = { $regex: query.name, $options: 'i' };
    if (query.phone) filter.phone = { $regex: query.phone, $options: 'i' };
    if (query.email) filter.email = { $regex: query.email, $options: 'i' };

    return Patient.find(filter).sort('-createdAt').exec();
  }

  static async getPatientById(id: string): Promise<IPatient> {
    const patient = await Patient.findById(id).populate('user', '-password');
    if (!patient) {
      const error: any = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }
    return patient;
  }
}
