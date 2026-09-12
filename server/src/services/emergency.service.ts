import EmergencyCase, { IEmergencyCase } from '../models/EmergencyCase';
import Doctor from '../models/Doctor';
import Bed from '../models/Bed';
import { Role } from '../models/User';

export class EmergencyService {
  static async registerEmergency(data: any): Promise<IEmergencyCase> {
    const { patientName, emergencyType, priority, symptoms, doctorId, bedId } = data;

    let doctorAssigned, bedAssigned;

    if (doctorId) {
      doctorAssigned = await Doctor.findById(doctorId);
      if (!doctorAssigned || !doctorAssigned.isActive) {
        throw Object.assign(new Error('Invalid or unavailable doctor'), { statusCode: 400 });
      }
    }

    if (bedId) {
      bedAssigned = await Bed.findById(bedId);
      if (!bedAssigned || bedAssigned.status !== 'Available') {
        throw Object.assign(new Error('Invalid or unavailable bed'), { statusCode: 400 });
      }
    }

    const emergencyCase = await EmergencyCase.create({
      patientName,
      emergencyType,
      priority,
      symptoms,
      doctor: doctorAssigned?._id,
      bed: bedAssigned?._id,
      status: bedAssigned ? 'Admitted' : (doctorAssigned ? 'Under Treatment' : 'Waiting'),
    });

    if (bedAssigned) {
      bedAssigned.status = 'Occupied';
      await bedAssigned.save();
    }

    return emergencyCase.populate(['doctor', 'bed']);
  }

  static async getEmergencyCases(query: any, user: any): Promise<IEmergencyCase[]> {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    if (user.role === Role.DOCTOR) {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        filter.doctor = doctor._id;
      }
    }

    return EmergencyCase.find(filter).populate('doctor').populate('bed').sort('-arrivalTime').exec();
  }
}
