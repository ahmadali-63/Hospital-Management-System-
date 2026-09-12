import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  admissionId: string;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  ward: mongoose.Types.ObjectId;
  bed: mongoose.Types.ObjectId;
  admissionDate: Date;
  dischargeDate?: Date;
  reason: string;
  status: 'Active' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema: Schema = new Schema(
  {
    admissionId: { type: String, required: true, unique: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    ward: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
    bed: { type: Schema.Types.ObjectId, ref: 'Bed', required: true },
    admissionDate: { type: Date, required: true, default: Date.now },
    dischargeDate: { type: Date },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  },
  {
    timestamps: true,
  }
);

// Auto-generate admissionId before saving
AdmissionSchema.pre<IAdmission>('validate', async function (next: any) {
  if (!this.admissionId) {
    try {
      const lastAdmission = await mongoose.model('Admission').findOne({}, {}, { sort: { createdAt: -1 } });
      let nextNum = 1;
      if (lastAdmission && lastAdmission.admissionId) {
        const parts = lastAdmission.admissionId.split('-');
        if (parts.length === 2) {
          nextNum = parseInt(parts[1], 10) + 1;
        }
      }
      this.admissionId = `ADM-${nextNum.toString().padStart(5, '0')}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model<IAdmission>('Admission', AdmissionSchema);
