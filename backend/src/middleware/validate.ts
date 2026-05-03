import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function validate(
  schema: ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const issues = result.error.errors
        .map(e => `${e.path.join('.') || 'field'}: ${e.message}`)
        .join('; ');
      return next(new AppError(`Validation error — ${issues}`, 422));
    }
    req[target] = result.data;
    next();
  };
}
