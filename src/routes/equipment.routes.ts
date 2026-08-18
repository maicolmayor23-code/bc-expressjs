import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller.js';

export const equipmentRouter = Router();

// Mapa de la API — Mapea verbos HTTP + URLs a funciones del controlador
equipmentRouter.get('/', equipmentController.getAll);
equipmentRouter.get('/:id', equipmentController.getById);
equipmentRouter.post('/', equipmentController.create);
equipmentRouter.put('/:id', equipmentController.update);
equipmentRouter.delete('/:id', equipmentController.remove);
