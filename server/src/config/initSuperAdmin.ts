import User, { Role } from '../models/User';
import Doctor from '../models/Doctor';
import Department from '../models/Department';
import logger from '../utils/logger';

async function syncAccount(
  name: string,
  email: string,
  password: string,
  role: Role,
  department?: string
) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role,
        department: department || 'General Medicine',
        isActive: true,
      });
      logger.info(`Initialized account: ${normalizedEmail} (${role})`);
    } else {
      let changed = false;
      if (user.role !== role) {
        user.role = role;
        changed = true;
      }
      if (!user.isActive) {
        user.isActive = true;
        changed = true;
      }
      const matches = await user.comparePassword(password);
      if (!matches) {
        user.password = password;
        changed = true;
      }
      if (changed) {
        await user.save();
        logger.info(`Updated account credentials: ${normalizedEmail}`);
      }
    }

    // Ensure Doctor document exists for DOCTOR role
    if (role === Role.DOCTOR && user) {
      const existingDoc = await Doctor.findOne({ user: user._id });
      if (!existingDoc) {
        let dept = await Department.findOne({ isActive: true });
        if (!dept) {
          dept = await Department.create({
            name: department || 'General Medicine',
            description: `${department || 'General Medicine'} Department`,
            isActive: true,
          });
        }
        await Doctor.create({
          user: user._id,
          name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
          specialization: department || 'General Medicine',
          department: dept._id,
          licenseNumber: 'MD-SYS',
          qualification: 'MBBS, MD',
          experience: 8,
          consultationFee: 1500,
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: { start: '09:00', end: '17:00' },
          status: 'Available',
          isActive: true,
        });
        logger.info(`Created Doctor profile for: ${normalizedEmail}`);
      }
    }
  } catch (err: any) {
    logger.warn(`Failed syncing account ${email}: ${err.message}`);
  }
}

export async function initSuperAdmin() {
  try {
    // 1. Super Admin from environment
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@hms.com').toLowerCase().trim();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin12345';
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    await syncAccount(
      superAdminName,
      superAdminEmail,
      superAdminPassword,
      Role.SUPER_ADMIN,
      'Administration'
    );

    // 2. Default Doctor Demo Accounts
    await syncAccount(
      'Dr. Imran Khan',
      'doctor01@hms.com',
      'doctor123',
      Role.DOCTOR,
      'Cardiology'
    );
    await syncAccount(
      'Dr. Abdullah Imran',
      'abdullah@hms.com',
      'doctor123',
      Role.DOCTOR,
      'Cardiology'
    );

    // 3. Default Patient Demo Account
    await syncAccount(
      'Ayesha Khan',
      'patient001@hms.com',
      'patient123',
      Role.PATIENT,
      'General Medicine'
    );

    // 4. Default Staff Demo Account
    await syncAccount(
      'Ahmad Khan',
      'ahmad@gmail.com',
      'ahmad12345',
      Role.STAFF,
      'Administration'
    );

    // 5. Default Admin Demo Account
    await syncAccount(
      'Hospital Admin',
      'admin@hms.com',
      'admin123',
      Role.ADMIN,
      'Administration'
    );
  } catch (error: any) {
    logger.error(`System accounts initialization warning: ${error.message}`);
  }
}
