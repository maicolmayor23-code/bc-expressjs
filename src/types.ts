import type { Equipment as PrismaEquipment, Category as PrismaCategory } from '@prisma/client';
import type {
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './schemas/equipment.schema.js';

// Exportar modelos derivados directamente de Prisma Client
export type Equipment = PrismaEquipment;
export type Category = PrismaCategory;

// Tipo ampliado con relación incluida (útil para respuestas GET con include)
export type EquipmentWithCategory = PrismaEquipment & {
  category: PrismaCategory;
};

export type { CreateEquipmentDto, UpdateEquipmentDto };

export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorIssue {
  field: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  issues?: ErrorIssue[];
}
