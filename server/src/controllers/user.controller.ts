import { Request, Response, NextFunction } from 'express';
import User, { Role } from '../models/User';

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = {};
      const { role, search } = req.query;

      if (role && role !== 'ALL') {
        filter.role = role;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: String(search), $options: 'i' } },
          { email: { $regex: String(search), $options: 'i' } },
        ];
      }

      const [users, total, superAdminCount, adminCount, doctorCount, staffCount, patientCount] = await Promise.all([
        User.find(filter).select('-password').sort('-createdAt').limit(200),
        User.countDocuments(),
        User.countDocuments({ role: Role.SUPER_ADMIN }),
        User.countDocuments({ role: Role.ADMIN }),
        User.countDocuments({ role: Role.DOCTOR }),
        User.countDocuments({ role: Role.STAFF }),
        User.countDocuments({ role: Role.PATIENT }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
          counts: {
            total,
            superAdmin: superAdminCount,
            admin: adminCount,
            doctor: doctorCount,
            staff: staffCount,
            patient: patientCount,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const requestingUser = (req as any).user;
      const targetUser = await User.findById(req.params.id);

      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Prevent non-super-admin from modifying a super-admin
      if (targetUser.role === Role.SUPER_ADMIN && requestingUser.role !== Role.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Only Super Admin can modify another Super Admin account' });
      }

      if (req.body.isActive !== undefined) {
        targetUser.isActive = Boolean(req.body.isActive);
      } else {
        targetUser.isActive = !targetUser.isActive;
      }

      await targetUser.save();

      res.status(200).json({
        success: true,
        message: `User ${targetUser.isActive ? 'activated' : 'disabled'} successfully`,
        data: { user: targetUser },
      });
    } catch (error) {
      next(error);
    }
  }
}
