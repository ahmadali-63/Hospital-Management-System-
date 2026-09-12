import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service';
import { Role } from '../models/User';

export class PatientController {
  static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const patients = await PatientService.getPatients(req.query);
      res.status(200).json({
        success: true,
        data: { patients },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientService.getPatientById(req.params.id as string);
      
      // RBAC Ownership Check for PATIENT role
      const user = (req as any).user;
      if (user.role === Role.PATIENT && patient.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to access this patient profile' });
      }

      res.status(200).json({
        success: true,
        data: { patient },
      });
    } catch (error) {
      next(error);
    }
  }
}
