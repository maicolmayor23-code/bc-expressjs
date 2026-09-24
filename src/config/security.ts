import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

// 1. Configuración de Helmet para HTTP Security Headers
export const helmetOptions: Parameters<typeof helmet>[0] = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  strictTransportSecurity: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  frameguard: { action: 'sameorigin' },
  referrerPolicy: { policy: 'no-referrer' },
};

// 2. Configuración de CORS con Whitelist de Orígenes
export const corsOptions: cors.CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Permitir solicitudes sin origen (como Postman, Thunder Client, cURL o servidor local)
    if (!requestOrigin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: El origen ${requestOrigin} no está permitido`));
    }
  },
  credentials: true, // Necesario para la transmisión de cookies HttpOnly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

// 3. Rate Limit Global (100 peticiones / 15 min por IP)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, // Límite de 100 peticiones
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: 'draft-7', // Cabeceras modernas RateLimit-*
  legacyHeaders: true, // Habilitar cabeceras legadas X-RateLimit-* (requerido para Postman / rúbrica)
  message: {
    error: 'Demasiadas peticiones desde esta IP, intente de nuevo en 15 minutos',
  },
});

// 4. Rate Limit Estricto para Autenticación (5 intentos / 15 min por IP)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5, // Máximo 5 peticiones (mitigación de fuerza bruta en /login y /register)
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: 'draft-7',
  legacyHeaders: true, // Habilitar cabeceras legadas X-RateLimit-* (requerido para Postman / rúbrica)
  message: {
    error: 'Demasiados intentos de autenticación, intente de nuevo en 15 minutos',
  },
});
