import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

/**
 * Middleware de Autorización basado en Roles (RBAC).
 * Verifica que el usuario autenticado (req.user) tenga uno de los roles permitidos.
 * 
 * - Si no está autenticado (req.user no existe) ➔ 401 Unauthorized
 * - Si el rol del usuario no está en la lista permitida ➔ 403 Forbidden
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'No autenticado: Token no proporcionado o inválido'));
      return;
    }

    const userRole = req.user.role;

    if (!userRole || !roles.includes(userRole)) {
      next(
        new AppError(
          403,
          `No autorizado: Permisos insuficientes (Se requiere rol [${roles.join(', ')}], pero se posee '${userRole ?? 'ninguno'}')`
        )
      );
      return;
    }

    next();
  };
}
