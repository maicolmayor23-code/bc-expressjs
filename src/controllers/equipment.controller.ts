import type { Request, Response, NextFunction } from 'express';
import * as equipmentService from '../services/equipment.service.js';
import { createEquipmentSchema, updateEquipmentSchema } from '../schemas/equipment.schema.js';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await equipmentService.getAllEquipment(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const equipment = await equipmentService.getEquipmentById(req.params.id as string);
    res.json(equipment);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createEquipmentSchema.parse(req.body);
    const equipment = await equipmentService.createEquipment(dto);
    res.status(201).json(equipment);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = updateEquipmentSchema.parse(req.body);
    const updated = await equipmentService.updateEquipment(req.params.id as string, dto);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await equipmentService.deleteEquipment(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
