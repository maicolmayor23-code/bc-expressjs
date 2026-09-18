import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  email: z
    .string()
    .email('El formato del email no es válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['admin', 'user']).optional().default('user'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('El formato del email no es válido'),
  password: z
    .string()
    .min(1, 'La contraseña no puede estar vacía'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
