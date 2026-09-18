import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const equipmentRouter = Router();

// Proteger todas las rutas del recurso principal con authMiddleware (Requisito Obligatorio)
equipmentRouter.use(authMiddleware);

equipmentRouter.get('/', equipmentController.getAll);
equipmentRouter.get('/:id', equipmentController.getById);
equipmentRouter.post('/', equipmentController.create);
equipmentRouter.put('/:id', equipmentController.update);
equipmentRouter.patch('/:id', equipmentController.update);
equipmentRouter.delete('/:id', equipmentController.remove);
