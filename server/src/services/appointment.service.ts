import Appointment, { IAppointment } from '../models/Appointment';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { Role } from '../models/User';

export class AppointmentService {
  static async bookAppointment(data: any, user: any): Promise<IAppointment> {
    const { doctorId, date, startTime, endTime, reason } = data;

    // Fetch Doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      const error: any = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    if (doctor.status === 'On Leave' || doctor.status === 'Offline' || !doctor.isActive) {
      const error: any = new Error('Doctor is not available');
      error.statusCode = 400;
      throw error;
    }

    // Determine patient ID based on role
    let patientId = data.patientId;
    if (user.role === Role.PATIENT) {
      // Find patient profile for logged-in user
      const patient = await Patient.findOne({ user: user._id });
      if (!patient) {
        const error: any = new Error('Patient profile not found');
        error.statusCode = 404;
        throw error;
      }
      patientId = patient._id;
    }

    // Check for double booking (Double Booking Test)
    const existingAppointment = await Appointment.findOne({
      doctor: doctor._id,
      date: new Date(date),
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // Overlapping time condition
      ],
      status: { $nin: ['Cancelled', 'No Show'] },
    });

    if (existingAppointment) {
      const error: any = new Error('Time slot is not available');
      error.statusCode = 409;
      throw error;
    }

    // Freeze the historical doctor fee
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctor._id,
      date: new Date(date),
      startTime,
      endTime,
      consultationFee: doctor.consultationFee,
      reason,
      status: 'Confirmed',
    });

    return appointment.populate(['patient', 'doctor']);
  }

  static async getAppointments(query: any, user: any): Promise<IAppointment[]> {
    const filter: any = {};
    
    // RBAC rules for viewing appointments
    if (user.role === Role.PATIENT) {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) filter.patient = patient._id;
    } else if (user.role === Role.DOCTOR) {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) filter.doctor = doctor._id;
    }

    // Additional query filters
    if (query.date) filter.date = new Date(query.date);
    if (query.status) filter.status = query.status;

    return Appointment.find(filter)
      .populate('patient')
      .populate('doctor')
      .sort('date startTime')
      .exec();
  }

  static async updateAppointmentStatus(id: string, status: string, user: any): Promise<IAppointment> {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      const error: any = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // RBAC specific updates
    if (user.role === Role.PATIENT) {
      const patient = await Patient.findOne({ user: user._id });
      if (appointment.patient.toString() !== patient?._id.toString()) {
        const error: any = new Error('Not authorized to update this appointment');
        error.statusCode = 403;
        throw error;
      }
      if (status !== 'Cancelled') {
        const error: any = new Error('Patients can only cancel their appointments');
        error.statusCode = 403;
        throw error;
      }
    } else if (user.role === Role.DOCTOR) {
      const doctor = await Doctor.findOne({ user: user._id });
      if (appointment.doctor.toString() !== doctor?._id.toString()) {
        const error: any = new Error('Not authorized to update this appointment');
        error.statusCode = 403;
        throw error;
      }
    }

    appointment.status = status as any;
    await appointment.save();

    return appointment;
  }
}
