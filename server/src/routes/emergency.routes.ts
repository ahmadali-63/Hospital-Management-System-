import { Router } from 'express';
import { EmergencyController } from '../controllers/emergency.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerEmergencySchema } from '../validators/emergency.validator';
import { Role } from '../models/User';

const router = Router();

router.use(protect);

router.post('/', authorize(Role.ADMIN), validate(registerEmergencySchema), EmergencyController.registerEmergency);
router.get('/', authorize(Role.ADMIN, Role.DOCTOR), EmergencyController.getEmergencyCases);

export default router;
