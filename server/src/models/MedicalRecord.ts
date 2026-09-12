import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment: mongoose.Types.ObjectId;
  symptoms: string[];
  diagnosis: string[];
  treatment: string;
  notes: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    symptoms: [{ type: String }],
    diagnosis: [{ type: String }],
    treatment: { type: String, required: true },
    notes: { type: String },
    followUpDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
