import type { z } from 'zod';
import type {
  equipmentCategorySchema,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './schemas/equipment.schema.js';

export type EquipmentCategory = z.infer<typeof equipmentCategorySchema>;

export interface Equipment {
  id: number;
  name: string;
  category: EquipmentCategory;
  dailyRate: number;
  isAvailable: boolean;
  createdAt: string;
}

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
