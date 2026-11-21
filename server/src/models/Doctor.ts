import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  doctorId: string;
  name: string;
  specialization: string;
  department: mongoose.Types.ObjectId;
  licenseNumber?: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  workingDays: string[];
  workingHours: { start: string; end: string };
  status: 'Available' | 'Busy' | 'On Leave' | 'Offline';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    doctorId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    licenseNumber: { type: String },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    workingDays: [{ type: String, required: true }],
    workingHours: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    status: { type: String, enum: ['Available', 'Busy', 'On Leave', 'Offline'], default: 'Available' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Auto-generate doctorId before saving
DoctorSchema.pre<IDoctor>('validate', async function (next: any) {
  if (!this.doctorId) {
    try {
      const lastDoctor = await mongoose.model('Doctor').findOne({}, {}, { sort: { createdAt: -1 } });
      let nextNum = 1;
      if (lastDoctor && lastDoctor.doctorId) {
        const parts = lastDoctor.doctorId.split('-');
        if (parts.length === 2) {
          nextNum = parseInt(parts[1], 10) + 1;
        }
      }
      this.doctorId = `DOC-${nextNum.toString().padStart(4, '0')}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
