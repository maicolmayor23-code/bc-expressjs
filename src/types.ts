import type { IEquipment } from './models/equipment.model.js';
import type { ICategory } from './models/category.model.js';
import type { CreateEquipmentDto, UpdateEquipmentDto } from './schemas/equipment.schema.js';
import type { CreateCategoryDto, UpdateCategoryDto } from './schemas/category.schema.js';

export type { IEquipment, ICategory, CreateEquipmentDto, UpdateEquipmentDto, CreateCategoryDto, UpdateCategoryDto };

export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
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
