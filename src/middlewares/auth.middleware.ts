import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../errors/AppError.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 1. Leer el token de la cabecera Authorization (Bearer) o cookie HttpOnly
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2. Si no hay token, el usuario no está autenticado
  if (!token) {
    next(new AppError(401, 'No autenticado: Token no proporcionado'));
    return;
  }

  try {
    // 3. Verificar y decodificar el token de acceso
    const decoded = verifyAccessToken(token);

    // 4. Adjuntar payload al request (req.user)
    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expirado'));
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Token inválido'));
      return;
    }
    next(new AppError(401, 'Autenticación fallida'));
  }
}
