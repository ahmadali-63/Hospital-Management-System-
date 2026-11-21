import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { Role } from '../models/User';

const router = Router();

router.use(protect);

// Only ADMIN and SUPER_ADMIN can view and manage all users/members
router.get('/', authorize(Role.ADMIN, Role.SUPER_ADMIN), UserController.getUsers);
router.patch('/:id/status', authorize(Role.ADMIN, Role.SUPER_ADMIN), UserController.updateUserStatus);

export default router;
