import express from 'express';
import type { Application, Request, Response } from 'express';
import { equipmentRouter } from './routes/equipment.routes.js';
import { morganMiddleware } from './config/logger.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Application {
  const app = express();

  // 1. Parser JSON para bodies de peticiones
  app.use(express.json());

  // 2. Logging de peticiones HTTP con Morgan dirigido a Winston
  app.use(morganMiddleware);

  // 3. Ruta raíz de bienvenida y health check
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: '🎧 API de Equipos — DJ / Sonido y Luces (Semana 04)',
      endpoints: {
        health: '/health',
        equipment: '/api/v1/equipment',
        itemsAlias: '/api/v1/items',
      },
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DJ Sound & Lights API',
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Montar recurso principal y alias de compatibilidad
  app.use('/api/v1/equipment', equipmentRouter);
  app.use('/api/v1/items', equipmentRouter);

  // 5. Middleware 404 para rutas inexistentes (responde JSON)
  app.use(notFoundHandler);

  // 6. Middleware global de manejo de errores (4 parámetros)
  app.use(errorHandler);

  return app;
}
