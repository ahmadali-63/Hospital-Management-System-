import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createDoctorSchema } from '../validators/doctor.validator';
import { Role } from '../models/User';

const router = Router();

// Publicly accessible (e.g. for patient searching)
router.get('/', protect, DoctorController.getDoctors);
router.get('/:id', protect, DoctorController.getDoctorById);

// Admin only routes
router.post('/', protect, authorize(Role.ADMIN), validate(createDoctorSchema), DoctorController.createDoctor);

export default router;
