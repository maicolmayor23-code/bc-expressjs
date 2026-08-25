import { z } from 'zod';

// Enum exacto de categorías para el dominio DJ / Sonido y Luces
export const equipmentCategorySchema = z.enum(['sound', 'lights', 'dj_gear', 'effects'], {
  message: 'La categoría debe ser una de: sound, lights, dj_gear, effects',
});

// Schema de creación
export const createEquipmentSchema = z.object({
  name: z
    .string({ message: 'El nombre debe ser un texto' })
    .min(1, 'El nombre no puede estar vacío')
    .trim(),
  category: equipmentCategorySchema,
  dailyRate: z
    .number({ message: 'La tarifa diaria debe ser un número' })
    .positive('La tarifa diaria debe ser mayor a 0'),
  isAvailable: z.boolean().default(true),
});

// Schema de actualización (reutiliza .partial())
export const updateEquipmentSchema = createEquipmentSchema.partial();

// Schema para validación de parámetro ID en rutas
export const equipmentIdParamSchema = z.object({
  id: z.coerce
    .number({ message: 'El ID debe ser un número' })
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo'),
});

// Schema para validación de parámetros de paginación en query string
export const queryPaginationSchema = z.object({
  page: z.coerce
    .number({ message: 'La página debe ser un número' })
    .int()
    .positive()
    .default(1),
  limit: z.coerce
    .number({ message: 'El límite debe ser un número' })
    .int()
    .positive()
    .default(10),
});

// Tipos TypeScript inferidos directamente de los schemas Zod
export type CreateEquipmentDto = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentDto = z.infer<typeof updateEquipmentSchema>;
export type EquipmentIdParam = z.infer<typeof equipmentIdParamSchema>;
export type QueryPagination = z.infer<typeof queryPaginationSchema>;
