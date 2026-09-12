import { Router } from 'express';
import { BedController } from '../controllers/bed.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { admitPatientSchema } from '../validators/bed.validator';
import { Role } from '../models/User';

const router = Router();

router.use(protect);

// Anyone logged in can view beds (useful for Doctor/Patient dashboards to see availability)
// In a stricter system we might limit PATIENT to only their own bed
router.get('/', BedController.getBeds);

// Only ADMIN can manage admissions and discharges
router.post('/admissions', authorize(Role.ADMIN), validate(admitPatientSchema), BedController.admitPatient);
router.patch('/admissions/:id/discharge', authorize(Role.ADMIN), BedController.dischargePatient);

export default router;
