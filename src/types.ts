// ============================================
// TYPES: Entidad, DTOs y Contratos de Respuesta API
// Dominio: DJ / Sonido y Luces (equipment)
// ============================================

export type EquipmentCategory = 'sound' | 'lights' | 'dj_gear' | 'effects';

export interface Equipment {
  id: number;
  name: string;
  category: EquipmentCategory;
  dailyRate: number;
  isAvailable: boolean;
  createdAt: string;
}

// DTO para crear nuevo equipo (omite campos autogenerados)
export type CreateEquipmentDto = Omit<Equipment, 'id' | 'createdAt'>;

// DTO para actualización (campos opcionales)
export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;

// Parámetros de paginación
export interface PaginationParams {
  page: number;
  limit: number;
}

// ============================================
// CONTRATOS DE RESPUESTA HTTP ESTÁNDAR
// ============================================

export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
