import User, { Role } from '../models/User';
import logger from '../utils/logger';

export async function initSuperAdmin() {
  try {
    const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@hms.com').toLowerCase().trim();
    const password = process.env.SUPER_ADMIN_PASSWORD || 'superadmin12345';
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    let superAdmin = await User.findOne({ email }).select('+password');
    if (!superAdmin) {
      superAdmin = await User.create({
        name,
        email,
        password,
        role: Role.SUPER_ADMIN,
        isActive: true,
      });
      logger.info(`Super Admin initialized: ${email}`);
    } else {
      if (superAdmin.role !== Role.SUPER_ADMIN) {
        superAdmin.role = Role.SUPER_ADMIN;
        await superAdmin.save();
        logger.info(`Updated existing user ${email} to SUPER_ADMIN role`);
      }
    }
  } catch (error: any) {
    logger.error(`Super Admin initialization warning: ${error.message}`);
  }
}
