import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    role: z.enum(['PATIENT', 'DOCTOR', 'STAFF']).optional().default('PATIENT'),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),

    // Patient specific fields
    dateOfBirth: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),

    // Doctor specific fields
    specialization: z.string().optional(),
    department: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.number().optional(),
    consultationFee: z.number().optional(),
    licenseNumber: z.string().optional(),

    // Staff specific fields
    designation: z.string().optional(),
  }),
});

export const registerPatientSchema = registerSchema;

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
