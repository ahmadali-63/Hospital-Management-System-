import Bed, { IBed } from '../models/Bed';
import Admission, { IAdmission } from '../models/Admission';
import Patient from '../models/Patient';
import { Role } from '../models/User';

export class BedService {
  static async getBeds(query: any): Promise<IBed[]> {
    const filter: any = {};
    if (query.ward) filter.ward = query.ward;
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    return Bed.find(filter).populate('ward').populate('currentPatient').exec();
  }

  static async admitPatient(data: any): Promise<IAdmission> {
    const { patientId, doctorId, wardId, bedId, reason } = data;

    // Check if patient already has active admission
    const activeAdmission = await Admission.findOne({ patient: patientId, status: 'Active' });
    if (activeAdmission) {
      throw Object.assign(new Error('Patient already has an active admission'), { statusCode: 409 });
    }

    // Check if bed is available
    const bed = await Bed.findById(bedId);
    if (!bed || bed.status !== 'Available') {
      throw Object.assign(new Error('Selected bed is not available'), { statusCode: 400 });
    }

    const admission = await Admission.create({
      patient: patientId,
      doctor: doctorId,
      ward: wardId,
      bed: bedId,
      reason,
    });

    // Update bed status
    bed.status = 'Occupied';
    bed.currentPatient = patientId;
    await bed.save();

    return admission.populate(['patient', 'doctor', 'ward', 'bed']);
  }

  static async dischargePatient(admissionId: string): Promise<IAdmission> {
    const admission = await Admission.findById(admissionId);
    if (!admission || admission.status === 'Completed') {
      throw Object.assign(new Error('Active admission not found'), { statusCode: 404 });
    }

    admission.status = 'Completed';
    admission.dischargeDate = new Date();
    await admission.save();

    // Release bed
    const bed = await Bed.findById(admission.bed);
    if (bed) {
      bed.status = 'Available';
      bed.currentPatient = undefined;
      await bed.save();
    }

    return admission;
  }
}
