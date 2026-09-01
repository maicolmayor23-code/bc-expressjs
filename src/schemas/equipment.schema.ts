import { z } from 'zod';

// Schema de creación de equipo
export const createEquipmentSchema = z.object({
  name: z
    .string({ message: 'El nombre debe ser un texto' })
    .min(1, 'El nombre no puede estar vacío')
    .trim(),
  serialNumber: z
    .string({ message: 'El número de serie debe ser un texto' })
    .min(1, 'El número de serie no puede estar vacío')
    .trim(),
  dailyRate: z
    .number({ message: 'La tarifa diaria debe ser un número' })
    .positive('La tarifa diaria debe ser mayor a 0'),
  isAvailable: z.boolean().default(true),
  categoryId: z
    .string({ message: 'El ID de la categoría es requerido' })
    .uuid('El ID de la categoría debe ser un UUID válido'),
});

// Schema de actualización (reutiliza .partial())
export const updateEquipmentSchema = createEquipmentSchema.partial();

// Schema para validación de parámetro ID en rutas (Estricto UUID para Semana 05)
export const equipmentIdParamSchema = z.object({
  id: z
    .string({ message: 'El ID debe ser un texto' })
    .uuid('El ID del equipo debe ser un UUID válido'),
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
