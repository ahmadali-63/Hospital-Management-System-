import Bill, { IBill } from '../models/Bill';
import Appointment from '../models/Appointment';
import Admission from '../models/Admission';
import EmergencyCase from '../models/EmergencyCase';
import Patient from '../models/Patient';
import { Role } from '../models/User';

export class BillingService {
  static async generateBill(data: any): Promise<IBill> {
    const { patientId, appointmentId, admissionId, emergencyCaseId, bedCharges, emergencyCharges, otherCharges } = data;

    let consultationFee = 0;

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) consultationFee = appointment.consultationFee;
    }

    const bill = await Bill.create({
      patient: patientId,
      appointment: appointmentId,
      admission: admissionId,
      emergencyCase: emergencyCaseId,
      consultationFee,
      bedCharges: bedCharges || 0,
      emergencyCharges: emergencyCharges || 0,
      otherCharges: otherCharges || 0,
      paidAmount: 0,
    });

    return bill.populate('patient');
  }

  static async getBills(query: any, user: any): Promise<IBill[]> {
    const filter: any = {};

    if (user.role === Role.PATIENT) {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) filter.patient = patient._id;
    }

    if (query.status) filter.status = query.status;

    return Bill.find(filter).populate('patient').sort('-createdAt').exec();
  }

  static async recordPayment(billId: string, amount: number): Promise<IBill> {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw Object.assign(new Error('Bill not found'), { statusCode: 404 });
    }

    bill.paidAmount += amount;
    await bill.save(); // pre-save hook recalculates remainingAmount and status

    return bill;
  }
}
