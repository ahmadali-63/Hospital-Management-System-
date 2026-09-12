import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User, { Role } from '../models/User';
import Department from '../models/Department';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Ward from '../models/Ward';
import Bed from '../models/Bed';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const patientFirstNames = ['Ayesha', 'Bilal', 'Hina', 'Usman', 'Sana', 'Hamza', 'Iqra', 'Fahad', 'Maham', 'Zain', 'Maryam', 'Talha', 'Laiba', 'Danish', 'Anam', 'Hassan', 'Fatima', 'Owais', 'Mehwish', 'Saad'];
const patientLastNames = ['Khan', 'Ahmed', 'Malik', 'Hussain', 'Iqbal', 'Sheikh', 'Qureshi', 'Butt', 'Raza', 'Javed'];
const doctorNames = [
  ['Imran', 'Khan', 'Cardiologist', 'Cardiology'], ['Nimra', 'Ahmed', 'Neurologist', 'Neurology'],
  ['Asad', 'Malik', 'Orthopedic Surgeon', 'Orthopedics'], ['Saira', 'Hussain', 'Dermatologist', 'Dermatology'],
  ['Hamid', 'Qureshi', 'Pediatrician', 'Pediatrics'], ['Rida', 'Sheikh', 'Gynecologist', 'Gynecology'],
  ['Kamran', 'Raza', 'General Physician', 'General Medicine'], ['Mariam', 'Javed', 'Psychiatrist', 'Psychiatry'],
  ['Waleed', 'Butt', 'ENT Specialist', 'ENT'], ['Alina', 'Iqbal', 'Radiologist', 'Radiology'],
] as const;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hms');
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const upsertUser = async (name: string, email: string, password: string, role: Role) => {
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = await User.create({ name, email, password, role });
  } else {
    user.name = name;
    user.password = password;
    user.role = role;
    user.isActive = true;
    await user.save();
  }

  return user;
};

const importData = async () => {
  try {
    await connectDB();

    const admin = await upsertUser('Ahmad Khan', 'ahmad@gmail.com', 'ahmad12345', Role.ADMIN);
    console.log(`Admin ready: ${admin.email} / ahmad12345`);

    const departmentNames = ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'Gynecology', 'General Medicine', 'Psychiatry', 'ENT', 'Radiology'];
    const departments = new Map<string, mongoose.Types.ObjectId>();
    for (const name of departmentNames) {
      const department = await Department.findOneAndUpdate(
        { name },
        { $setOnInsert: { name, description: `${name} department` } },
        { upsert: true, new: true },
      );
      departments.set(name, department._id);
    }

    for (let index = 0; index < 100; index += 1) {
      const firstName = patientFirstNames[index % patientFirstNames.length];
      const lastName = patientLastNames[Math.floor(index / patientFirstNames.length)];
      const sequence = String(index + 1).padStart(3, '0');
      const name = `${firstName} ${lastName}`;
      const email = `patient${sequence}@hms.com`;
      const user = await upsertUser(name, email, `${firstName.toLowerCase()}12345`, Role.PATIENT);

      await Patient.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            name, email, phone: `0300${String(1000000 + index).padStart(7, '0')}`,
            dateOfBirth: new Date(1985 + (index % 20), index % 12, (index % 27) + 1),
            gender: index % 2 === 0 ? 'Female' : 'Male', bloodGroup: ['A+', 'B+', 'O+', 'AB+'][index % 4],
            address: `House ${index + 1}, Gulberg, Lahore, Pakistan`, emergencyContact: `0310${String(2000000 + index).padStart(7, '0')}`,
          },
          $setOnInsert: { user: user._id, patientId: `PAT-${String(index + 1).padStart(5, '0')}` },
        },
        { upsert: true, new: true },
      );
    }

    for (let index = 0; index < doctorNames.length; index += 1) {
      const [firstName, lastName, specialization, departmentName] = doctorNames[index];
      const name = `Dr. ${firstName} ${lastName}`;
      const email = `doctor${String(index + 1).padStart(2, '0')}@hms.com`;
      const user = await upsertUser(name, email, `${firstName.toLowerCase()}12345`, Role.DOCTOR);

      await Doctor.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            name, specialization, department: departments.get(departmentName), qualification: 'MBBS, FCPS',
            experience: 5 + index, consultationFee: 1500 + (index * 100),
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            workingHours: { start: '09:00', end: '17:00' }, status: 'Available', isActive: true,
          },
          $setOnInsert: { user: user._id, doctorId: `DOC-${String(index + 1).padStart(4, '0')}` },
        },
        { upsert: true, new: true },
      );
    }

    const wards = [{ name: 'General Ward A', type: 'General' }, { name: 'ICU Ward 1', type: 'ICU' }];
    for (const wardData of wards) {
      const ward = await Ward.findOneAndUpdate({ name: wardData.name }, { $setOnInsert: wardData }, { upsert: true, new: true });
      const bedCount = wardData.type === 'ICU' ? 10 : 25;
      for (let bedIndex = 1; bedIndex <= bedCount; bedIndex += 1) {
        const prefix = wardData.type === 'ICU' ? 'ICU-1' : 'GW-A';
        const bedNumber = `${prefix}-${bedIndex}`;
        await Bed.updateOne({ bedNumber }, { $setOnInsert: { bedNumber, ward: ward._id, type: wardData.type } }, { upsert: true });
      }
    }

    console.log('Seed complete: 1 admin, 100 patients, 10 doctors, wards, and beds are ready.');
    console.log('Admin login: ahmad@gmail.com / ahmad12345');
    console.log('Patient passwords: first-name lowercase + 12345, for example patient001 uses ayesha12345.');
    console.log('Doctor passwords: first-name lowercase + 12345, for example doctor01 uses imran12345.');
  } catch (error) {
    console.error('Error importing data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

importData();
