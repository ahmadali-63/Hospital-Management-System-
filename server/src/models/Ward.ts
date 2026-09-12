import mongoose, { Schema, Document } from 'mongoose';

export interface IWard extends Document {
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WardSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWard>('Ward', WardSchema);
