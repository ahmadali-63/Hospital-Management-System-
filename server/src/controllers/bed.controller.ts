import { Request, Response, NextFunction } from 'express';
import { BedService } from '../services/bed.service';

export class BedController {
  static async getBeds(req: Request, res: Response, next: NextFunction) {
    try {
      const beds = await BedService.getBeds(req.query);
      res.status(200).json({ success: true, data: { beds } });
    } catch (error) {
      next(error);
    }
  }

  static async getWards(req: Request, res: Response, next: NextFunction) {
    try {
      const wards = await BedService.getWards();
      res.status(200).json({ success: true, data: { wards } });
    } catch (error) {
      next(error);
    }
  }

  static async getAdmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const admissions = await BedService.getAdmissions(req.query);
      res.status(200).json({ success: true, data: { admissions } });
    } catch (error) {
      next(error);
    }
  }

  static async admitPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await BedService.admitPatient(req.body);
      res.status(201).json({ success: true, message: 'Patient admitted successfully', data: { admission } });
    } catch (error) {
      next(error);
    }
  }

  static async dischargePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await BedService.dischargePatient(req.params.id as string);
      res.status(200).json({ success: true, message: 'Patient discharged successfully', data: { admission } });
    } catch (error) {
      next(error);
    }
  }
}
