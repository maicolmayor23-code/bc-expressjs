import * as equipmentRepo from '../repositories/equipment.repository.js';
import * as categoryRepo from '../repositories/category.repository.js';
import { AppError } from '../errors/AppError.js';
import type { CreateEquipmentDto, UpdateEquipmentDto } from '../schemas/equipment.schema.js';
import type { IEquipment } from '../models/equipment.model.js';

export async function getAllEquipment(
  page = 1,
  limit = 10,
): Promise<equipmentRepo.PaginatedResult<IEquipment>> {
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, Math.min(100, limit));
  return await equipmentRepo.findAll(validPage, validLimit);
}

export async function getEquipmentById(id: string): Promise<IEquipment> {
  const equipment = await equipmentRepo.findById(id);
  if (!equipment) {
    throw new AppError(404, 'Equipo no encontrado');
  }
  return equipment;
}

export async function createEquipment(dto: CreateEquipmentDto): Promise<IEquipment> {
  const categoryExists = await categoryRepo.findById(dto.category);
  if (!categoryExists) {
    throw new AppError(400, 'La categoría referenciada no existe');
  }

  return await equipmentRepo.create(dto);
}

export async function updateEquipment(
  id: string,
  dto: UpdateEquipmentDto,
): Promise<IEquipment> {
  if (dto.category) {
    const categoryExists = await categoryRepo.findById(dto.category);
    if (!categoryExists) {
      throw new AppError(400, 'La categoría referenciada no existe');
    }
  }

  const equipment = await equipmentRepo.update(id, dto);
  if (!equipment) {
    throw new AppError(404, 'Equipo no encontrado');
  }
  return equipment;
}

export async function deleteEquipment(id: string): Promise<void> {
  const equipment = await equipmentRepo.remove(id);
  if (!equipment) {
    throw new AppError(404, 'Equipo no encontrado');
  }
}
