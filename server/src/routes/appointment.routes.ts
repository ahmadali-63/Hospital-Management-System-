import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { bookAppointmentSchema, updateAppointmentStatusSchema } from '../validators/appointment.validator';
import { Role } from '../models/User';

const router = Router();

router.use(protect);

router.post('/', validate(bookAppointmentSchema), authorize(Role.PATIENT, Role.ADMIN), AppointmentController.bookAppointment);
router.get('/', AppointmentController.getAppointments);
router.patch('/:id/status', validate(updateAppointmentStatusSchema), AppointmentController.updateAppointmentStatus);

export default router;
