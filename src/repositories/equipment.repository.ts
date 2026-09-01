import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import type { CreateEquipmentDto, UpdateEquipmentDto } from '../schemas/equipment.schema.js';
import type { EquipmentWithCategory, PaginatedResponse } from '../types.js';

/**
 * Maneja los errores conocidos de Prisma convirtiéndolos a AppError
 */
function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new AppError(404, 'Recurso no encontrado');
    }
    if (error.code === 'P2002') {
      throw new AppError(409, 'Ya existe un registro con ese valor');
    }
  }
  throw error;
}

/**
 * Obtiene el listado paginado de equipos desde PostgreSQL usando skip y take
 */
export async function findAll(
  page: number,
  limit: number,
): Promise<PaginatedResponse<EquipmentWithCategory>> {
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.equipment.findMany({
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.equipment.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Busca un equipo por su ID UUID incluyendo la relación con su Categoría
 */
export async function findById(id: string): Promise<EquipmentWithCategory | null> {
  try {
    return await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Crea un nuevo equipo en PostgreSQL con validaciones de clave foránea
 */
export async function create(dto: CreateEquipmentDto): Promise<EquipmentWithCategory> {
  try {
    return await prisma.equipment.create({
      data: dto,
      include: {
        category: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Actualiza los campos de un equipo existente por ID UUID
 */
export async function update(
  id: string,
  dto: UpdateEquipmentDto,
): Promise<EquipmentWithCategory> {
  try {
    return await prisma.equipment.update({
      where: { id },
      data: dto,
      include: {
        category: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Elimina un equipo por ID UUID en PostgreSQL
 */
export async function remove(id: string): Promise<void> {
  try {
    await prisma.equipment.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
