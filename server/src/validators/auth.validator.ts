import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerPatientSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
    gender: z.enum(['Male', 'Female', 'Other']),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    address: z.string().min(5, 'Address is required'),
    emergencyContact: z.string().min(10, 'Emergency contact is required'),
  }),
});
