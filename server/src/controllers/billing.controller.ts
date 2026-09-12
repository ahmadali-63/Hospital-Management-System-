import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';

export class BillingController {
  static async generateBill(req: Request, res: Response, next: NextFunction) {
    try {
      const bill = await BillingService.generateBill(req.body);
      res.status(201).json({ success: true, message: 'Bill generated successfully', data: { bill } });
    } catch (error) {
      next(error);
    }
  }

  static async getBills(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const bills = await BillingService.getBills(req.query, user);
      res.status(200).json({ success: true, data: { bills } });
    } catch (error) {
      next(error);
    }
  }

  static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const bill = await BillingService.recordPayment(req.params.id as string, req.body.amount);
      res.status(200).json({ success: true, message: 'Payment recorded', data: { bill } });
    } catch (error) {
      next(error);
    }
  }
}
