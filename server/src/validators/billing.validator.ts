import { z } from 'zod';

export const generateBillSchema = z.object({
  body: z.object({
    patientId: z.string().length(24, 'Invalid patient ID'),
    appointmentId: z.string().length(24, 'Invalid appointment ID').optional(),
    admissionId: z.string().length(24, 'Invalid admission ID').optional(),
    emergencyCaseId: z.string().length(24, 'Invalid emergency case ID').optional(),
    bedCharges: z.number().min(0).optional(),
    emergencyCharges: z.number().min(0).optional(),
    otherCharges: z.number().min(0).optional(),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Payment amount must be greater than 0'),
  }),
});
