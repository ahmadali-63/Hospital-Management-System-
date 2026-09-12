import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';

export class AppointmentController {
  static async bookAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const appointment = await AppointmentService.bookAppointment(req.body, user);
      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const appointments = await AppointmentService.getAppointments(req.query, user);
      res.status(200).json({
        success: true,
        data: { appointments },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAppointmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const appointment = await AppointmentService.updateAppointmentStatus(req.params.id as string, req.body.status, user);
      res.status(200).json({
        success: true,
        message: 'Appointment status updated',
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }
}
