import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Error de validación de Zod
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      error: 'Validation Error',
      message: 'Los datos enviados no son válidos',
      issues,
    });
    return;
  }

  // 2. Error operacional conocido (AppError)
  if (err instanceof AppError) {
    logger.warn(`[AppError] Status: ${err.statusCode} - ${err.message}`);

    res.status(err.statusCode).json({
      error: 'Application Error',
      message: err.message,
    });
    return;
  }

  // 3. Error genérico / no controlado (500)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = err instanceof Error ? err.message : 'Internal server error';

  logger.error(`[ServerError] ${errorMessage}`, { error: err });

  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? errorMessage : 'Internal server error',
  });
}
