import type { Request, Response, NextFunction } from 'express';
import * as equipmentService from '../services/equipment.service.js';
import type {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  SingleResponse,
  PaginatedResponse,
  ErrorResponse,
  Equipment,
} from '../types.js';

/**
 * GET /api/v1/equipment — Listar equipos con paginación
 */
export async function getAll(
  req: Request,
  res: Response<PaginatedResponse<Equipment> | ErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Query parameters "page" and "limit" must be positive integers',
      });
      return;
    }

    const result = await equipmentService.findAll({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/equipment/:id — Obtener equipo por ID
 */
export async function getById(
  req: Request,
  res: Response<SingleResponse<Equipment> | ErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'ID must be a valid number' });
      return;
    }

    const equipment = await equipmentService.findById(id);
    if (!equipment) {
      res.status(404).json({ error: 'Not Found', message: `Equipment with ID ${id} not found` });
      return;
    }

    res.json({ data: equipment });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/equipment — Crear nuevo equipo
 */
export async function create(
  req: Request,
  res: Response<SingleResponse<Equipment> | ErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, category, dailyRate, isAvailable } = req.body as Partial<CreateEquipmentDto>;

    // Validación básica de entrada en la interfaz HTTP
    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Field "name" is required and must be a non-empty string',
      });
      return;
    }

    const validCategories = ['sound', 'lights', 'dj_gear', 'effects'];
    if (!category || !validCategories.includes(category)) {
      res.status(400).json({
        error: 'Bad Request',
        message: `Field "category" is required and must be one of: ${validCategories.join(', ')}`,
      });
      return;
    }

    if (typeof dailyRate !== 'number' || dailyRate < 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Field "dailyRate" must be a positive number',
      });
      return;
    }

    const dto: CreateEquipmentDto = {
      name: name.trim(),
      category,
      dailyRate,
      isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
    };

    const newEquipment = await equipmentService.create(dto);
    res.status(201).json({ data: newEquipment });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/equipment/:id — Actualizar equipo completo
 */
export async function update(
  req: Request,
  res: Response<SingleResponse<Equipment> | ErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'ID must be a valid number' });
      return;
    }

    const dto = req.body as UpdateEquipmentDto;
    const updatedEquipment = await equipmentService.update(id, dto);

    if (!updatedEquipment) {
      res.status(404).json({ error: 'Not Found', message: `Equipment with ID ${id} not found` });
      return;
    }

    res.json({ data: updatedEquipment });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/equipment/:id — Eliminar equipo
 */
export async function remove(
  req: Request,
  res: Response<void | ErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'ID must be a valid number' });
      return;
    }

    const deleted = await equipmentService.remove(id);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: `Equipment with ID ${id} not found` });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
