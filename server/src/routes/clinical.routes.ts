import { Router } from 'express';
import { ClinicalController } from '../controllers/clinical.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { addMedicalRecordSchema, createPrescriptionSchema } from '../validators/clinical.validator';
import { Role } from '../models/User';

const router = Router();

router.use(protect);

// Medical Records
router.post('/records', authorize(Role.DOCTOR), validate(addMedicalRecordSchema), ClinicalController.addMedicalRecord);
router.get('/records/:patientId', ClinicalController.getMedicalRecords); // Allowed for PATIENT (own) and DOCTOR (assigned)

// Prescriptions
router.post('/prescriptions', authorize(Role.DOCTOR), validate(createPrescriptionSchema), ClinicalController.createPrescription);
router.get('/prescriptions/:patientId', ClinicalController.getPrescriptions); // Allowed for PATIENT (own) and DOCTOR

export default router;
