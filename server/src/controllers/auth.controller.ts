import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  static async registerPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.registerPatient(req.body);
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is set by authMiddleware
      const user = (req as any).user;
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
