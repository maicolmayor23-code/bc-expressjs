import * as equipmentRepository from '../repositories/equipment.repository.js';
import { AppError } from '../errors/AppError.js';
import type {
  EquipmentWithCategory,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  PaginatedResponse,
} from '../types.js';
import type { QueryPagination } from '../schemas/equipment.schema.js';

/**
 * Obtiene el listado paginado de equipos desde PostgreSQL
 */
export async function findAll(
  params: QueryPagination,
): Promise<PaginatedResponse<EquipmentWithCategory>> {
  const page = Math.max(1, params.page);
  const limit = Math.max(1, params.limit);

  return equipmentRepository.findAll(page, limit);
}

/**
 * Obtiene un equipo por su ID UUID o lanza AppError(404) si no existe
 */
export async function findById(id: string): Promise<EquipmentWithCategory> {
  const equipment = await equipmentRepository.findById(id);
  if (!equipment) {
    throw new AppError(404, 'Recurso no encontrado');
  }
  return equipment;
}

/**
 * Crea un nuevo equipo aplicando reglas de negocio de dominio
 */
export async function create(dto: CreateEquipmentDto): Promise<EquipmentWithCategory> {
  if (dto.dailyRate <= 0) {
    throw new AppError(400, 'La tarifa diaria debe ser mayor a 0');
  }

  return equipmentRepository.create(dto);
}

/**
 * Actualiza un equipo existente por ID UUID o lanza AppError(404) si no existe
 */
export async function update(
  id: string,
  dto: UpdateEquipmentDto,
): Promise<EquipmentWithCategory> {
  if (dto.dailyRate !== undefined && dto.dailyRate <= 0) {
    throw new AppError(400, 'La tarifa diaria debe ser mayor a 0');
  }

  return equipmentRepository.update(id, dto);
}

/**
 * Elimina un equipo por ID UUID o lanza AppError(404) si no existe
 */
export async function remove(id: string): Promise<void> {
  return equipmentRepository.remove(id);
}
