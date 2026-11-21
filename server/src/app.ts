import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import clinicalRoutes from './routes/clinical.routes';
import bedRoutes from './routes/bed.routes';
import emergencyRoutes from './routes/emergency.routes';
import billingRoutes from './routes/billing.routes';
import userRoutes from './routes/user.routes';
import './models/Department';
import User from './models/User';
import Patient from './models/Patient';
import Doctor from './models/Doctor';
import Appointment from './models/Appointment';
import Bed from './models/Bed';
import Admission from './models/Admission';
import { protect } from './middlewares/auth.middleware';

const app: Application = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    // Allow all local development origins (localhost, 127.0.0.1, LAN 192.168.x.x, 10.x.x.x, 172.x.x.x)
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    // Allow configured CLIENT_URL
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    // In development mode, allow any origin
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/users', userRoutes);

// Dashboard Statistics Overview
app.get('/api/stats', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalPatients,
      availableDoctors,
      totalDoctors,
      totalBeds,
      availableBeds,
      recentAdmissions,
      totalUsers,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments({ status: 'Available', isActive: true }),
      Doctor.countDocuments(),
      Bed.countDocuments(),
      Bed.countDocuments({ status: 'Available' }),
      Admission.find()
        .populate('patient', 'name patientId')
        .populate('ward', 'name')
        .sort('-admissionDate')
        .limit(5),
      User.countDocuments(),
    ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        availableDoctors,
        totalDoctors,
        todayAppointments,
        availableBeds,
        totalBeds,
        recentAdmissions,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running.' });
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
