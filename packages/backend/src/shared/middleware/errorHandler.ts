import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
