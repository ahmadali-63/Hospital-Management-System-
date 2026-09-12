import { z } from 'zod';

export const addMedicalRecordSchema = z.object({
  body: z.object({
    appointmentId: z.string().length(24, 'Invalid appointment ID'),
    symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
    diagnosis: z.array(z.string()).min(1, 'At least one diagnosis is required'),
    treatment: z.string().min(2, 'Treatment details are required'),
    notes: z.string().optional(),
    followUpDate: z.string().optional(),
  }),
});

export const createPrescriptionSchema = z.object({
  body: z.object({
    appointmentId: z.string().length(24, 'Invalid appointment ID'),
    medicines: z.array(z.object({
      name: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
      duration: z.string().min(1, 'Duration is required'),
      instructions: z.string().optional(),
    })).min(1, 'At least one medicine must be prescribed'),
  }),
});
