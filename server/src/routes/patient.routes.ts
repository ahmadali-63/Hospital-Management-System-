import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { Role } from '../models/User';

const router = Router();

// ADMIN and STAFF can get the list of all patients
router.get('/', protect, authorize(Role.ADMIN, Role.STAFF), PatientController.getPatients);

// Patients can get their own profile, Admins/Doctors can get any profile
router.get('/:id', protect, PatientController.getPatientById);

export default router;
