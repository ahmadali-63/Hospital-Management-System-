import mongoose, { Schema, Document } from 'mongoose';

export interface IBed extends Document {
  bedNumber: string;
  ward: mongoose.Types.ObjectId;
  type: 'General' | 'Private' | 'ICU' | 'Emergency' | 'Pediatric';
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  currentPatient?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BedSchema: Schema = new Schema(
  {
    bedNumber: { type: String, required: true, unique: true },
    ward: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
    type: {
      type: String,
      enum: ['General', 'Private', 'ICU', 'Emergency', 'Pediatric'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
      default: 'Available',
    },
    currentPatient: { type: Schema.Types.ObjectId, ref: 'Patient' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBed>('Bed', BedSchema);
