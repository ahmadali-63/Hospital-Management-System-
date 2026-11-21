import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { Role } from '../models/User';
import { getJwtSecret } from '../config/auth';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded: any = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to token no longer exists' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'User account is disabled' });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    // SUPER_ADMIN has full access to all protected routes
    if (!user || (!roles.includes(user.role) && user.role !== Role.SUPER_ADMIN)) {
      return res.status(403).json({
        success: false,
        message: `User role ${user?.role || 'Unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};
