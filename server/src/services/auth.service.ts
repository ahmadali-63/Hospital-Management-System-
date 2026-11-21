import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User, { Role, IUser } from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import Department from '../models/Department';
import { getJwtSecret } from '../config/auth';

export class AuthService {
  static generateToken(id: string, role: string): string {
    return jwt.sign({ id, role }, getJwtSecret(), {
      expiresIn: '1d',
    });
  }

  static async register(data: any): Promise<{ user: IUser; token: string }> {
    const userEmail = (data.email || '').toLowerCase().trim();
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      const error: any = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const requestedRole = (data.role || Role.PATIENT).toUpperCase();
    let assignedRole: Role = Role.PATIENT;
    if (requestedRole === 'DOCTOR') assignedRole = Role.DOCTOR;
    else if (requestedRole === 'STAFF') assignedRole = Role.STAFF;
    else assignedRole = Role.PATIENT;

    // Create user
    const user = await User.create({
      name: data.name,
      email: userEmail,
      password: data.password,
      role: assignedRole,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
    });

    if (assignedRole === Role.PATIENT) {
      await Patient.create({
        user: user._id,
        name: data.name,
        email: userEmail,
        phone: data.phone || '0000000000',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(1990, 0, 1),
        gender: data.gender || 'Other',
        bloodGroup: data.bloodGroup || 'O+',
        address: data.address || 'Address provided on first visit',
        emergencyContact: data.emergencyContact || data.phone || '0000000000',
      });
    } else if (assignedRole === Role.DOCTOR) {
      let dept: any = null;
      if (data.department && mongoose.Types.ObjectId.isValid(data.department)) {
        dept = await Department.findById(data.department);
      }
      if (!dept && typeof data.department === 'string' && data.department.trim()) {
        dept = await Department.findOne({
          name: { $regex: new RegExp(`^${data.department.trim()}$`, 'i') },
        });
      }
      if (!dept) {
        dept = await Department.findOne({ isActive: true });
      }
      if (!dept) {
        const deptName =
          typeof data.department === 'string' && data.department.trim()
            ? data.department.trim()
            : 'General Medicine';
        dept = await Department.create({
          name: deptName,
          description: `${deptName} Department`,
          isActive: true,
        });
      }

      await Doctor.create({
        user: user._id,
        name: data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`,
        specialization: data.specialization || 'General Practitioner',
        department: dept._id,
        licenseNumber: data.licenseNumber || 'MD-REG',
        qualification: data.qualification || 'MBBS',
        experience: Number(data.experience) || 3,
        consultationFee: Number(data.consultationFee) || 50,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '17:00' },
        status: 'Available',
        isActive: true,
      });
    }

    const token = this.generateToken(user._id.toString(), user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse as IUser, token };
  }

  static async registerPatient(data: any): Promise<{ user: IUser; token: string }> {
    return this.register({ ...data, role: Role.PATIENT });
  }

  static async login(data: any): Promise<{ user: IUser; token: string }> {
    const email = (data.email || '').toLowerCase().trim();
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error('Account is disabled');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user._id.toString(), user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse as IUser, token };
  }
}
