import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor.service';

export class DoctorController {
  static async createDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.createDoctor(req.body);
      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: { doctor },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const doctors = await DoctorService.getDoctors(req.query);
      res.status(200).json({
        success: true,
        data: { doctors },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: { doctor },
      });
    } catch (error) {
      next(error);
    }
  }
}
