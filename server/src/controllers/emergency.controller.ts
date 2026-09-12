import { Request, Response, NextFunction } from 'express';
import { EmergencyService } from '../services/emergency.service';

export class EmergencyController {
  static async registerEmergency(req: Request, res: Response, next: NextFunction) {
    try {
      const emergencyCase = await EmergencyService.registerEmergency(req.body);
      res.status(201).json({ success: true, message: 'Emergency case registered', data: { emergencyCase } });
    } catch (error) {
      next(error);
    }
  }

  static async getEmergencyCases(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const cases = await EmergencyService.getEmergencyCases(req.query, user);
      res.status(200).json({ success: true, data: { cases } });
    } catch (error) {
      next(error);
    }
  }
}
