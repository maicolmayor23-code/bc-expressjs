import * as equipmentRepository from '../repositories/equipment.repository.js';
import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  PaginationParams,
  PaginatedResponse,
} from '../types.js';

/**
 * Obtiene el listado de equipos paginado
 */
export async function findAll(params: PaginationParams): Promise<PaginatedResponse<Equipment>> {
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
 * Obtiene un equipo por su ID
 */
export async function findById(id: number): Promise<Equipment | undefined> {
  return equipmentRepository.findById(id);
}

/**
 * Crea un nuevo equipo verificando reglas de negocio
 */
export async function create(dto: CreateEquipmentDto): Promise<Equipment> {
  // Regla de negocio: tarifa diaria mínima de 0
  if (dto.dailyRate < 0) {
    throw new Error('Daily rate cannot be negative');
  }

  return equipmentRepository.create(dto);
}

/**
 * Actualiza un equipo existente
 */
export async function update(id: number, dto: UpdateEquipmentDto): Promise<Equipment | undefined> {
  const existing = await equipmentRepository.findById(id);
  if (!existing) {
    return undefined;
  }

  if (dto.dailyRate !== undefined && dto.dailyRate < 0) {
    throw new Error('Daily rate cannot be negative');
  }

  return equipmentRepository.update(id, dto);
}

/**
 * Elimina un equipo por ID
 */
export async function remove(id: number): Promise<boolean> {
  const existing = await equipmentRepository.findById(id);
  if (!existing) {
    return false;
  }

  return equipmentRepository.remove(id);
}
