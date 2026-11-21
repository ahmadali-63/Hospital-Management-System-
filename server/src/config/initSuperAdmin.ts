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
      let changed = false;
      if (superAdmin.role !== Role.SUPER_ADMIN) {
        superAdmin.role = Role.SUPER_ADMIN;
        changed = true;
      }
      if (!superAdmin.isActive) {
        superAdmin.isActive = true;
        changed = true;
      }
      const matches = await superAdmin.comparePassword(password);
      if (!matches) {
        superAdmin.password = password; // Will be hashed by User pre-save hook
        changed = true;
      }
      if (changed) {
        await superAdmin.save();
        logger.info(`Synchronized Super Admin credentials with .env`);
      }
    }
  } catch (error: any) {
    logger.error(`Super Admin initialization warning: ${error.message}`);
  }
}
