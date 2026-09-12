import { Request, Response, NextFunction } from 'express';
import { ClinicalService } from '../services/clinical.service';

export class ClinicalController {
  static async addMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const record = await ClinicalService.addMedicalRecord(req.body, user);
      res.status(201).json({ success: true, data: { record } });
    } catch (error) {
      next(error);
    }
  }

  static async getMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const records = await ClinicalService.getMedicalRecords(req.params.patientId as string, user);
      res.status(200).json({ success: true, data: { records } });
    } catch (error) {
      next(error);
    }
  }

  static async createPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const prescription = await ClinicalService.createPrescription(req.body, user);
      res.status(201).json({ success: true, data: { prescription } });
    } catch (error) {
      next(error);
    }
  }

  static async getPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const prescriptions = await ClinicalService.getPrescriptions(req.params.patientId as string, user);
      res.status(200).json({ success: true, data: { prescriptions } });
    } catch (error) {
      next(error);
    }
  }
}
