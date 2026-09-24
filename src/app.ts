import express from 'express';
import type { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

import { helmetOptions, corsOptions, globalLimiter } from './config/security.js';
import { authRouter } from './routes/auth.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { equipmentRouter } from './routes/equipment.routes.js';
import { exerciseRouter } from './routes/exercise.routes.js';
import { morganMiddleware } from './config/logger.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Application {
  const app = express();

  // 1. Cabeceras de seguridad HTTP con Helmet (debe ser el primer middleware)
  app.use(helmet(helmetOptions));

  // 2. Control de acceso de orígenes cruzados (CORS) con Whitelist
  app.use(cors(corsOptions));

  // 3. Limitador global de peticiones (100 peticiones / 15 min por IP)
  app.use(globalLimiter);

  // 4. Parsers para JSON y Cookies HttpOnly
  app.use(express.json());
  app.use(cookieParser());

  // 5. Sanitización contra ataques de NoSQL Injection (elimina $ y .)
  app.use((req, _res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
  });

  // 6. Logging de peticiones HTTP con Morgan / Winston
  app.use(morganMiddleware);

  // 7. Ruta raíz y health check
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: '🎧 API REST DJ / Sonido y Luces (Semana 08 — API Segura con RBAC + Helmet + CORS + Rate Limiting)',
      security: {
        rbac: 'Activo (authMiddleware + requireRole)',
        helmet: 'Activo (X-Content-Type-Options: nosniff, CSP, HSTS)',
        cors: 'Whitelist de orígenes (credentials: true)',
        rateLimit: 'Global (100 req/15min) y Auth (5 req/15min)',
        sanitization: 'express-mongo-sanitize (NoSQL Injection mitigated)',
      },
      endpoints: {
        health: '/health',
        exercises: {
          public: 'GET /public (o /api/v1/public) — Sin auth',
          dashboard: 'GET /dashboard (o /api/v1/dashboard) — User & Admin',
          adminUsers: 'GET /admin/users (o /api/v1/admin/users) — Admin only (403 para user)',
        },
        auth: {
          register: 'POST /api/v1/auth/register (Rate Limited: 5/15m)',
          login: 'POST /api/v1/auth/login (Rate Limited: 5/15m)',
          me: 'GET /api/v1/auth/me (Protegido)',
          refresh: 'POST /api/v1/auth/refresh',
          logout: 'POST /api/v1/auth/logout',
        },
        equipment: {
          list: 'GET /api/v1/equipment (Protegido)',
          getById: 'GET /api/v1/equipment/:id (Protegido)',
          create: 'POST /api/v1/equipment (Autenticado - user/admin)',
          update: 'PUT/PATCH /api/v1/equipment/:id (Autenticado - dueño/admin)',
          delete: 'DELETE /api/v1/equipment/:id (Exclusivo - requireRole admin)',
        },
        categories: '/api/v1/categories',
      },
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DJ Sound & Lights API (Security & RBAC Enabled)',
      timestamp: new Date().toISOString(),
    });
  });

  // 8. Montar routers
  app.use('/', exerciseRouter);
  app.use('/api/v1', exerciseRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/equipment', equipmentRouter);
  app.use('/api/v1/items', equipmentRouter); // Alias de compatibilidad para la rúbrica

  // 9. Middleware 404 para rutas inexistentes
  app.use(notFoundHandler);

  // 10. Middleware global de manejo de errores (sin stack traces en producción)
  app.use(errorHandler);

  return app;
}
