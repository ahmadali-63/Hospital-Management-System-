import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  user: mongoose.Types.ObjectId;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  emergencyContact: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    patientId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    address: { type: String, required: true },
    emergencyContact: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Auto-generate patientId before saving
PatientSchema.pre<IPatient>('validate', async function (next: any) {
  if (!this.patientId) {
    try {
      // Find the last patient to determine the next ID
      const lastPatient = await mongoose.model('Patient').findOne({}, {}, { sort: { createdAt: -1 } });
      let nextNum = 1;
      if (lastPatient && lastPatient.patientId) {
        const parts = lastPatient.patientId.split('-');
        if (parts.length === 2) {
          nextNum = parseInt(parts[1], 10) + 1;
        }
      }
      this.patientId = `PAT-${nextNum.toString().padStart(5, '0')}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model<IPatient>('Patient', PatientSchema);
