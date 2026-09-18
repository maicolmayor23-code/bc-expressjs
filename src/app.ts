import express from 'express';
import type { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { equipmentRouter } from './routes/equipment.routes.js';
import { morganMiddleware } from './config/logger.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Application {
  const app = express();

  // 1. Parsers para JSON y Cookies HttpOnly
  app.use(express.json());
  app.use(cookieParser());

  // 2. Logging de peticiones HTTP con Morgan
  app.use(morganMiddleware);

  // 3. Ruta raíz y health check
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: '🎧 API REST DJ / Sonido y Luces (Semana 07 — Autenticación JWT + Cookies HttpOnly)',
      endpoints: {
        health: '/health',
        auth: {
          register: 'POST /api/v1/auth/register',
          login: 'POST /api/v1/auth/login',
          me: 'GET /api/v1/auth/me (Protegido)',
          refresh: 'POST /api/v1/auth/refresh',
          logout: 'POST /api/v1/auth/logout',
        },
        equipment: {
          list: 'GET /api/v1/equipment (Protegido)',
          getById: 'GET /api/v1/equipment/:id (Protegido)',
          create: 'POST /api/v1/equipment (Protegido)',
          update: 'PUT/PATCH /api/v1/equipment/:id (Protegido)',
          delete: 'DELETE /api/v1/equipment/:id (Protegido)',
        },
        categories: '/api/v1/categories',
      },
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DJ Sound & Lights API (JWT Auth + MongoDB)',
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Montar routers
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/equipment', equipmentRouter);
  app.use('/api/v1/items', equipmentRouter); // Alias de compatibilidad para la rúbrica

  // 5. Middleware 404 para rutas inexistentes
  app.use(notFoundHandler);

  // 6. Middleware global de manejo de errores
  app.use(errorHandler);

  return app;
}
