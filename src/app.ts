import express from 'express';
import type { Application, Request, Response } from 'express';
import { categoryRouter } from './routes/category.routes.js';
import { equipmentRouter } from './routes/equipment.routes.js';
import { morganMiddleware } from './config/logger.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Application {
  const app = express();

  // 1. Parser JSON para bodies de peticiones
  app.use(express.json());

  // 2. Logging de peticiones HTTP con Morgan
  app.use(morganMiddleware);

  // 3. Ruta raíz y health check
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: '🎧 API REST DJ / Sonido y Luces (Semana 06 — MongoDB + Mongoose)',
      endpoints: {
        health: '/health',
        categories: '/api/v1/categories',
        equipment: '/api/v1/equipment',
        itemsAlias: '/api/v1/items',
      },
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DJ Sound & Lights API (MongoDB + Mongoose)',
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Montar routers de entidades (secundaria: categories, principal: equipment e items alias)
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/equipment', equipmentRouter);
  app.use('/api/v1/items', equipmentRouter); // Alias de compatibilidad para la rúbrica

  // 5. Middleware 404 para rutas inexistentes
  app.use(notFoundHandler);

  // 6. Middleware global de manejo de errores
  app.use(errorHandler);

  return app;
}
