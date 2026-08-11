// ============================================
// TYPES: Interfaz del recurso principal (Equipment)
// Dominio: DJ / Sonido y Luces
// ============================================

export type EquipmentCategory = 'sound' | 'lights' | 'dj_gear' | 'effects';

export interface Equipment {
  id: number;
  name: string;
  category: EquipmentCategory;
  dailyRate: number;
  isAvailable: boolean;
}

// DTO usado para crear un nuevo equipo (sin id, se genera automáticamente)
export type CreateEquipmentDto = Omit<Equipment, 'id'>;

// DTO para actualización (todos los campos editables)
export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;
