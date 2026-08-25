import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller.js';

export const equipmentRouter = Router();

// 1. GET /api/v1/equipment — Listar paginado
equipmentRouter.get('/', equipmentController.getAll);

// 2. GET /api/v1/equipment/:id — Obtener por ID
equipmentRouter.get('/:id', equipmentController.getById);

// 3. POST /api/v1/equipment — Crear equipo validando Zod
equipmentRouter.post('/', equipmentController.create);

// 4. PUT /api/v1/equipment/:id — Actualizar equipo
equipmentRouter.put('/:id', equipmentController.update);

// 5. DELETE /api/v1/equipment/:id — Eliminar equipo
equipmentRouter.delete('/:id', equipmentController.remove);
