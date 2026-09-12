import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User, { Role } from '../models/User';
import Department from '../models/Department';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Ward from '../models/Ward';
import Bed from '../models/Bed';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hms');
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Ward.deleteMany();
    await Bed.deleteMany();

    console.log('Data Cleared!');

    // 1. Create Admin
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      name: 'Admin User',
      email: 'admin@hms.com',
      password: adminPassword,
      role: Role.ADMIN,
    });

    // 2. Create Departments
    const cardiology = await Department.create({ name: 'Cardiology', description: 'Heart center' });
    const neurology = await Department.create({ name: 'Neurology', description: 'Brain center' });
    const orthopedics = await Department.create({ name: 'Orthopedics', description: 'Bones and joints' });

    // 3. Create Doctors
    const doctorPassword = await bcrypt.hash('doctor123', salt);
    
    const userDoc1 = await User.create({ name: 'Dr. John Doe', email: 'john@hms.com', password: doctorPassword, role: Role.DOCTOR });
    await Doctor.create({
      user: userDoc1._id,
      name: 'Dr. John Doe',
      specialization: 'Cardiologist',
      department: cardiology._id,
      qualification: 'MBBS, MD',
      experience: 10,
      consultationFee: 1500,
      workingDays: ['Monday', 'Wednesday', 'Friday'],
      workingHours: { start: '09:00', end: '17:00' }
    });

    const userDoc2 = await User.create({ name: 'Dr. Sarah Smith', email: 'sarah@hms.com', password: doctorPassword, role: Role.DOCTOR });
    await Doctor.create({
      user: userDoc2._id,
      name: 'Dr. Sarah Smith',
      specialization: 'Neurologist',
      department: neurology._id,
      qualification: 'MBBS, MS',
      experience: 8,
      consultationFee: 2000,
      workingDays: ['Tuesday', 'Thursday', 'Saturday'],
      workingHours: { start: '10:00', end: '18:00' }
    });

    // 4. Create Wards & Beds
    const generalWard = await Ward.create({ name: 'General Ward A', type: 'General' });
    const icuWard = await Ward.create({ name: 'ICU Ward 1', type: 'ICU' });

    for (let i = 1; i <= 5; i++) {
      await Bed.create({ bedNumber: `GW-A-${i}`, ward: generalWard._id, type: 'General' });
    }
    for (let i = 1; i <= 3; i++) {
      await Bed.create({ bedNumber: `ICU-1-${i}`, ward: icuWard._id, type: 'ICU' });
    }

    console.log('Seed Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
