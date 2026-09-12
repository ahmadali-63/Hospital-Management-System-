import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: (e as any).errors,
        });
      }
      return res.status(400).json({ success: false, message: e.message });
    }
  };
};
