import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { generateBillSchema, recordPaymentSchema } from '../validators/billing.validator';
import { Role } from '../models/User';

const router = Router();

router.use(protect);

router.post('/', authorize(Role.ADMIN), validate(generateBillSchema), BillingController.generateBill);
router.get('/', BillingController.getBills); // Patients can see their own, Admins can see all
router.post('/:id/pay', authorize(Role.ADMIN), validate(recordPaymentSchema), BillingController.recordPayment);

export default router;
