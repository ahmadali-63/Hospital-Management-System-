import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User, { Role } from '../models/User';
import Department from '../models/Department';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Ward from '../models/Ward';
import Bed from '../models/Bed';
import Appointment from '../models/Appointment';
import Admission from '../models/Admission';
import EmergencyCase from '../models/EmergencyCase';
import MedicalRecord from '../models/MedicalRecord';
import Prescription from '../models/Prescription';
import Bill from '../models/Bill';

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

    // Super Admin from .env
    const superAdmin = await upsertUser(
      process.env.SUPER_ADMIN_NAME || 'Super Admin',
      process.env.SUPER_ADMIN_EMAIL || 'superadmin@hms.com',
      process.env.SUPER_ADMIN_PASSWORD || 'superadmin12345',
      Role.SUPER_ADMIN
    );
    console.log(`Super Admin ready: ${superAdmin.email} / ${process.env.SUPER_ADMIN_PASSWORD || 'superadmin12345'}`);

    // Primary Admin from README
    const admin = await upsertUser('Hospital Admin', 'admin@hms.com', 'admin123', Role.ADMIN);
    // Secondary Admin
    await upsertUser('Ahmad Khan', 'ahmad@gmail.com', 'ahmad12345', Role.ADMIN);
    console.log(`Admin ready: ${admin.email} / admin123`);

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

    // Primary Doctor from README
    const johnUser = await upsertUser('Dr. John Smith', 'john@hms.com', 'doctor123', Role.DOCTOR);
    const johnDoctor = await Doctor.findOneAndUpdate(
      { user: johnUser._id },
      {
        $set: {
          name: 'Dr. John Smith',
          specialization: 'Cardiologist',
          department: departments.get('Cardiology'),
          qualification: 'MBBS, MD (Cardiology)',
          experience: 12,
          consultationFee: 2000,
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: { start: '09:00', end: '17:00' },
          status: 'Available',
          isActive: true,
        },
        $setOnInsert: { user: johnUser._id, doctorId: 'DOC-0000' },
      },
      { upsert: true, new: true },
    );
    console.log(`Doctor ready: ${johnUser.email} / doctor123`);

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

    // Seed sample clinical records, appointments, admissions, emergency cases, and billing
    const patient1 = await Patient.findOne();
    const doctor1 = await Doctor.findOne();
    const ward1 = await Ward.findOne();
    const bed1 = await Bed.findOne({ status: 'Available' });

    if (patient1 && doctor1) {
      const existingAppt = await Appointment.findOne();
      if (!existingAppt) {
        const appointment = await Appointment.create({
          patient: patient1._id,
          doctor: doctor1._id,
          date: new Date(),
          startTime: '10:00',
          endTime: '10:30',
          consultationFee: doctor1.consultationFee,
          reason: 'Routine cardiology checkup',
          status: 'Confirmed',
        });

        await MedicalRecord.create({
          patient: patient1._id,
          doctor: doctor1._id,
          appointment: appointment._id,
          symptoms: ['Chest tightness', 'Mild shortness of breath'],
          diagnosis: ['Mild hypertension'],
          treatment: 'Prescribed lifestyle adjustments and low-dose antihypertensive.',
          notes: 'Follow up in 2 weeks.',
        });

        await Prescription.create({
          patient: patient1._id,
          doctor: doctor1._id,
          appointment: appointment._id,
          medicines: [
            {
              name: 'Amlodipine 5mg',
              dosage: '1 tablet',
              frequency: 'Once daily',
              duration: '14 days',
              instructions: 'Take in the morning with water.',
            },
          ],
        });

        await Bill.create({
          patient: patient1._id,
          appointment: appointment._id,
          consultationFee: doctor1.consultationFee,
          bedCharges: 0,
          emergencyCharges: 0,
          otherCharges: 0,
          totalAmount: doctor1.consultationFee,
          paidAmount: doctor1.consultationFee,
          remainingAmount: 0,
          status: 'Paid',
        });
      }
    }

    if (patient1 && doctor1 && ward1 && bed1) {
      const existingAdm = await Admission.findOne({ status: 'Active' });
      if (!existingAdm) {
        const patient2 = await Patient.findOne().skip(1);
        if (patient2) {
          await Admission.create({
            patient: patient2._id,
            doctor: doctor1._id,
            ward: ward1._id,
            bed: bed1._id,
            admissionDate: new Date(),
            reason: 'Post-operative observation',
            status: 'Active',
          });
          bed1.status = 'Occupied';
          bed1.currentPatient = patient2._id as any;
          await bed1.save();
        }
      }
    }

    const existingEmr = await EmergencyCase.findOne();
    if (!existingEmr) {
      await EmergencyCase.create({
        patientName: 'Tariq Mehmood',
        emergencyType: 'Acute Chest Pain',
        priority: 'Critical',
        symptoms: ['Severe chest pain', 'Profuse sweating', 'Tachycardia'],
        doctor: doctor1?._id,
        status: 'Under Treatment',
      });
      await EmergencyCase.create({
        patientName: 'Zubair Ali',
        emergencyType: 'Road Traffic Accident',
        priority: 'High',
        symptoms: ['Laceration on right arm', 'Pain in shoulder'],
        status: 'Waiting',
      });
    }

    console.log('Seed complete: Admin, doctors, patients, wards, beds, and sample data are ready.');
    console.log('Admin login (README): admin@hms.com / admin123');
    console.log('Doctor login (README): john@hms.com / doctor123');
    console.log('Alternative Admin: ahmad@gmail.com / ahmad12345');
  } catch (error) {
    console.error('Error importing data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

importData();
