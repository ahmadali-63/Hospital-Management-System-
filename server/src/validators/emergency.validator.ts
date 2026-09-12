import { z } from 'zod';

export const registerEmergencySchema = z.object({
  body: z.object({
    patientName: z.string().min(2, 'Patient name is required'),
    emergencyType: z.string().min(2, 'Emergency type is required'),
    priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
    symptoms: z.array(z.string()).optional(),
    doctorId: z.string().length(24, 'Invalid doctor ID').optional(),
    bedId: z.string().length(24, 'Invalid bed ID').optional(),
  }),
});
