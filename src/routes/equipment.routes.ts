import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.js';

export const equipmentRouter = Router();

// Proteger todas las rutas del recurso principal con authMiddleware
equipmentRouter.use(authMiddleware);

// Rutas accesibles por cualquier usuario autenticado (user o admin)
equipmentRouter.get('/', equipmentController.getAll);
equipmentRouter.get('/:id', equipmentController.getById);
equipmentRouter.post('/', requireRole('user', 'admin'), equipmentController.create);
equipmentRouter.put('/:id', equipmentController.update);
equipmentRouter.patch('/:id', equipmentController.update);

// Ruta exclusiva de Administración — Requiere rol 'admin' (devuelve 403 si es 'user')
equipmentRouter.delete('/:id', requireRole('admin'), equipmentController.remove);
