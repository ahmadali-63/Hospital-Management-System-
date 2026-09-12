import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().length(24, 'Invalid doctor ID'),
    patientId: z.string().length(24, 'Invalid patient ID').optional(), // Only for admin booking
    date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    reason: z.string().optional(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show']),
  }),
});
