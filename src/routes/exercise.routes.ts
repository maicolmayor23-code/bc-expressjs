import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.js';

export const exerciseRouter = Router();

/**
 * Ejercicio 01 — Ruta Pública sin autenticación
 * Accesible sin token (devuelve 200 OK)
 */
exerciseRouter.get('/public', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Ruta pública accesible sin token de autenticación',
  });
});

/**
 * Ejercicio 01 — Ruta user+admin protegida
 * Accesible para cualquier usuario autenticado con rol 'user' o 'admin'
 */
exerciseRouter.get('/dashboard', authMiddleware, requireRole('user', 'admin'), (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: `Bienvenido al Dashboard. Acceso permitido para usuario '${req.user?.name}' con rol '${req.user?.role}'.`,
    user: req.user,
  });
});

/**
 * Ejercicio 01 — Ruta admin-only protegida
 * Devuelve 403 Forbidden para usuarios con rol 'user'
 * Devuelve 200 OK únicamente para usuarios con rol 'admin'
 */
exerciseRouter.get('/admin/users', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Lista de usuarios del sistema (Exclusivo para Administradores)',
    data: [
      { id: 'usr_1', name: 'DJ Admin', email: 'admin@djstore.com', role: 'admin' },
      { id: 'usr_2', name: 'DJ Member', email: 'user@djstore.com', role: 'user' },
    ],
  });
});
