import type { Request, Response, NextFunction } from 'express';
import * as equipmentService from '../services/equipment.service.js';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentIdParamSchema,
  queryPaginationSchema,
} from '../schemas/equipment.schema.js';
import type {
  SingleResponse,
  PaginatedResponse,
  EquipmentWithCategory,
} from '../types.js';

/**
 * GET /api/v1/equipment — Listar equipos con paginación en BD
 */
export async function getAll(
  req: Request,
  res: Response<PaginatedResponse<EquipmentWithCategory>>,
  next: NextFunction,
): Promise<void> {
  try {
    const parseResult = queryPaginationSchema.safeParse(req.query);
    if (!parseResult.success) {
      return next(parseResult.error);
    }

    const result = await equipmentService.findAll(parseResult.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/equipment/:id — Obtener equipo por ID (UUID) incluyendo relación de categoría
 */
export async function getById(
  req: Request,
  res: Response<SingleResponse<EquipmentWithCategory>>,
  next: NextFunction,
): Promise<void> {
  try {
    const paramResult = equipmentIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return next(paramResult.error);
    }

    const equipment = await equipmentService.findById(paramResult.data.id);
    res.json({ data: equipment });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/equipment — Crear nuevo equipo en PostgreSQL
 */
export async function create(
  req: Request,
  res: Response<SingleResponse<EquipmentWithCategory>>,
  next: NextFunction,
): Promise<void> {
  try {
    const bodyResult = createEquipmentSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return next(bodyResult.error);
    }

    const newEquipment = await equipmentService.create(bodyResult.data);
    res.status(201).json({ data: newEquipment });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/equipment/:id — Actualizar equipo en PostgreSQL
 */
export async function update(
  req: Request,
  res: Response<SingleResponse<EquipmentWithCategory>>,
  next: NextFunction,
): Promise<void> {
  try {
    const paramResult = equipmentIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return next(paramResult.error);
    }

    const bodyResult = updateEquipmentSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return next(bodyResult.error);
    }

    const updatedEquipment = await equipmentService.update(paramResult.data.id, bodyResult.data);
    res.json({ data: updatedEquipment });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/equipment/:id — Eliminar equipo de PostgreSQL
 */
export async function remove(
  req: Request,
  res: Response<void>,
  next: NextFunction,
): Promise<void> {
  try {
    const paramResult = equipmentIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return next(paramResult.error);
    }

    await equipmentService.remove(paramResult.data.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
