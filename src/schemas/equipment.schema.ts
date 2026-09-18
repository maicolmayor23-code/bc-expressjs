import { z } from 'zod';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const createEquipmentSchema = z.object({
  name: z.string().min(1, 'El nombre del equipo es requerido').max(120, 'El nombre del equipo no puede superar 120 caracteres'),
  serialNumber: z.string().min(1, 'El número de serie es requerido'),
  brand: z.string().min(1, 'La marca es requerida'),
  dailyRate: z.number().min(0, 'La tarifa diaria no puede ser negativa'),
  isAvailable: z.boolean().optional(),
  category: z
    .string()
    .min(1, 'La categoría es requerida')
    .regex(OBJECT_ID_REGEX, 'ID de categoría inválido (debe ser un ObjectId de 24 caracteres hexadecimales)'),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export type CreateEquipmentDto = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentDto = z.infer<typeof updateEquipmentSchema>;
