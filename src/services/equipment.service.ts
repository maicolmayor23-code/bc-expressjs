import * as equipmentRepository from '../repositories/equipment.repository.js';
import { AppError } from '../errors/AppError.js';
import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  PaginatedResponse,
} from '../types.js';
import type { QueryPagination } from '../schemas/equipment.schema.js';

/**
 * Obtiene el listado paginado de equipos
 */
export async function findAll(params: QueryPagination): Promise<PaginatedResponse<Equipment>> {
  const allEquipment = await equipmentRepository.findAll();
  const total = allEquipment.length;

  const page = Math.max(1, params.page);
  const limit = Math.max(1, params.limit);

  const start = (page - 1) * limit;
  const data = allEquipment.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
  };
}

/**
 * Obtiene un equipo por su ID o lanza AppError(404) si no existe
 */
export async function findById(id: number): Promise<Equipment> {
  const equipment = await equipmentRepository.findById(id);
  if (!equipment) {
    throw new AppError(404, `Equipment with ID ${id} not found`);
  }
  return equipment;
}

/**
 * Crea un nuevo equipo aplicando reglas de negocio de dominio
 */
export async function create(dto: CreateEquipmentDto): Promise<Equipment> {
  if (dto.dailyRate <= 0) {
    throw new AppError(400, 'Daily rate must be greater than 0');
  }

  return equipmentRepository.create(dto);
}

/**
 * Actualiza un equipo existente por ID o lanza AppError(404) si no existe
 */
export async function update(id: number, dto: UpdateEquipmentDto): Promise<Equipment> {
  // Verificar existencia previa
  await findById(id);

  if (dto.dailyRate !== undefined && dto.dailyRate <= 0) {
    throw new AppError(400, 'Daily rate must be greater than 0');
  }

  const updated = await equipmentRepository.update(id, dto);
  if (!updated) {
    throw new AppError(404, `Equipment with ID ${id} not found`);
  }

  return updated;
}

/**
 * Elimina un equipo por ID o lanza AppError(404) si no existe
 */
export async function remove(id: number): Promise<void> {
  // Verificar existencia previa
  await findById(id);

  const deleted = await equipmentRepository.remove(id);
  if (!deleted) {
    throw new AppError(404, `Equipment with ID ${id} not found`);
  }
}
