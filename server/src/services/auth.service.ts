import jwt from 'jsonwebtoken';
import User, { Role, IUser } from '../models/User';
import Patient from '../models/Patient';
import { getJwtSecret } from '../config/auth';

export class AuthService {
  static generateToken(id: string, role: string): string {
    return jwt.sign({ id, role }, getJwtSecret(), {
      expiresIn: '1d',
    });
  }

  static async registerPatient(data: any): Promise<{ user: IUser; token: string }> {
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      const error: any = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: Role.PATIENT,
    });

    // Create patient profile
    await Patient.create({
      user: user._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      address: data.address,
      emergencyContact: data.emergencyContact,
    });

    const token = this.generateToken(user._id.toString(), user.role);
    
    // Convert to object and remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse as IUser, token };
  }

  static async login(data: any): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: data.email }).select('+password');
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
