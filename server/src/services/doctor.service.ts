import Doctor, { IDoctor } from '../models/Doctor';
import Department, { IDepartment } from '../models/Department';
import User, { Role } from '../models/User';

export class DoctorService {
  static async getDepartments(): Promise<IDepartment[]> {
    return Department.find({ isActive: true }).sort('name').exec();
  }

  static async createDoctor(data: any): Promise<IDoctor> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      const error: any = new Error('Email is already associated with a user');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: Role.DOCTOR,
    });

    const doctor = await Doctor.create({
      user: user._id,
      name: data.name,
      specialization: data.specialization,
      department: data.department,
      qualification: data.qualification,
      experience: data.experience,
      consultationFee: data.consultationFee,
      workingDays: data.workingDays,
      workingHours: data.workingHours,
    });

    return doctor.populate('department');
  }

  static async getDoctors(query: any): Promise<IDoctor[]> {
    const filter: any = { isActive: true };
    if (query.department) filter.department = query.department;
    if (query.specialization) filter.specialization = { $regex: query.specialization, $options: 'i' };
    if (query.name) filter.name = { $regex: query.name, $options: 'i' };
    if (query.status) filter.status = query.status;

    let dbQuery = Doctor.find(filter).populate('department');
    
    // Simple sorting support
    if (query.sort === 'fee_asc') dbQuery = dbQuery.sort('consultationFee');
    if (query.sort === 'fee_desc') dbQuery = dbQuery.sort('-consultationFee');
    if (query.sort === 'experience_desc') dbQuery = dbQuery.sort('-experience');

    return dbQuery.exec();
  }

  static async getDoctorById(id: string): Promise<IDoctor> {
    const doctor = await Doctor.findById(id).populate('department');
    if (!doctor) {
      const error: any = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }
    return doctor;
  }
}
