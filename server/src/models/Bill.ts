import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  billId: string;
  patient: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  admission?: mongoose.Types.ObjectId;
  emergencyCase?: mongoose.Types.ObjectId;
  consultationFee: number;
  bedCharges: number;
  emergencyCharges: number;
  otherCharges: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Partially Paid' | 'Paid';
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema = new Schema(
  {
    billId: { type: String, required: true, unique: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    admission: { type: Schema.Types.ObjectId, ref: 'Admission' },
    emergencyCase: { type: Schema.Types.ObjectId, ref: 'EmergencyCase' },
    consultationFee: { type: Number, default: 0 },
    bedCharges: { type: Number, default: 0 },
    emergencyCharges: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    remainingAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Paid'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
BillSchema.pre<IBill>('save', function (next: any) {
  this.totalAmount = this.consultationFee + this.bedCharges + this.emergencyCharges + this.otherCharges;
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  if (this.remainingAmount <= 0 && this.totalAmount > 0) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0 && this.remainingAmount > 0) {
    this.status = 'Partially Paid';
  } else {
    this.status = 'Pending';
  }
  next();
});

// Auto-generate billId
BillSchema.pre<IBill>('validate', async function (next: any) {
  if (!this.billId) {
    try {
      const lastBill = await mongoose.model('Bill').findOne({}, {}, { sort: { createdAt: -1 } });
      let nextNum = 1;
      if (lastBill && lastBill.billId) {
        const parts = lastBill.billId.split('-');
        if (parts.length === 2) {
          nextNum = parseInt(parts[1], 10) + 1;
        }
      }
      this.billId = `INV-${nextNum.toString().padStart(6, '0')}`;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model<IBill>('Bill', BillSchema);
