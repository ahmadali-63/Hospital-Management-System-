import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    specialization: z.string().min(2, 'Specialization is required'),
    department: z.string().length(24, 'Invalid department ID'), // MongoDB ObjectId length
    qualification: z.string().min(2, 'Qualification is required'),
    experience: z.number().min(0, 'Experience must be a positive number'),
    consultationFee: z.number().min(0, 'Fee cannot be negative'),
    workingDays: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).min(1),
    workingHours: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    }),
  }),
});
