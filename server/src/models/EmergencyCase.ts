import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyCase extends Document {
  caseId: string;
  patient?: mongoose.Types.ObjectId; // Optional because an emergency patient might not be registered yet
  patientName: string;
  emergencyType: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  symptoms: string[];
  arrivalTime: Date;
  doctor?: mongoose.Types.ObjectId;
  bed?: mongoose.Types.ObjectId;
  status: 'Waiting' | 'Under Treatment' | 'Admitted' | 'Discharged' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyCaseSchema: Schema = new Schema(
  {
    caseId: { type: String, required: true, unique: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
    patientName: { type: String, required: true },
    emergencyType: { type: String, required: true },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
    },
    symptoms: [{ type: String }],
    arrivalTime: { type: Date, default: Date.now },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    bed: { type: Schema.Types.ObjectId, ref: 'Bed' },
    status: {
      type: String,
      enum: ['Waiting', 'Under Treatment', 'Admitted', 'Discharged', 'Completed'],
      default: 'Waiting',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate caseId
EmergencyCaseSchema.pre<IEmergencyCase>('validate', async function (next: any) {
  if (!this.caseId) {
    try {
      const lastCase = await mongoose.model('EmergencyCase').findOne({}, {}, { sort: { arrivalTime: -1 } });
      let nextNum = 1;
      if (lastCase && lastCase.caseId) {
        const parts = lastCase.caseId.split('-');
        if (parts.length === 2) {
          nextNum = parseInt(parts[1], 10) + 1;
        }
      }
      this.caseId = `EMR-${nextNum.toString().padStart(5, '0')}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model<IEmergencyCase>('EmergencyCase', EmergencyCaseSchema);
