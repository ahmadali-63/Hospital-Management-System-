import { z } from 'zod';

export const admitPatientSchema = z.object({
  body: z.object({
    patientId: z.string().length(24, 'Invalid patient ID'),
    doctorId: z.string().length(24, 'Invalid doctor ID'),
    wardId: z.string().length(24, 'Invalid ward ID'),
    bedId: z.string().length(24, 'Invalid bed ID'),
    reason: z.string().min(2, 'Admission reason is required'),
  }),
});
