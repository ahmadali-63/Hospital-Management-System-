import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointmentId: string;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: Date;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  consultationFee: number;
  reason?: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    appointmentId: { type: String, required: true, unique: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    consultationFee: { type: Number, required: true }, // Store fee at time of booking
    reason: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate appointmentId before saving
AppointmentSchema.pre<IAppointment>('validate', async function (next: any) {
  if (!this.appointmentId) {
    try {
      const lastAppointment = await mongoose.model('Appointment').findOne({}, {}, { sort: { createdAt: -1 } });
      let nextNum = 1;
      if (lastAppointment && lastAppointment.appointmentId) {
        const parts = lastAppointment.appointmentId.split('-');
        if (parts.length === 2) {
          nextNum = parseInt(parts[1], 10) + 1;
        }
      }
      this.appointmentId = `APT-${nextNum.toString().padStart(5, '0')}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
