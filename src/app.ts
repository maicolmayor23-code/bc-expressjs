import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import { equipmentRouter } from './routes/equipment.routes.js';

export function createApp(): Application {
  const app = express();

  // 1. express.json() — Parseo de body JSON (requerido para POST/PUT)
  app.use(express.json());

  // 2. Logger personalizado — Registra método, URL, status y tiempo transcurrido
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${method} ${url} ${statusCode} - ${duration}ms`);
    });

    next();
  });

  // Ruta raíz de bienvenida
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: '🎧 Bienvenid@ a la API de DJ / Sonido y Luces',
      endpoints: {
        health: '/health',
        equipment: '/api/v1/equipment',
      },
    });
  });

  // 3. Health check (endpoint de verificación del estado del servidor)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'DJ Sound & Lights API',
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Rutas del recurso principal de equipos
  app.use('/api/v1/equipment', equipmentRouter);
  app.use('/api/v1/items', equipmentRouter); // Alias para compatibilidad con la especificación

  // 5. Handler para rutas no encontradas (404)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // 6. Error handler global — SIEMPRE el último app.use() con 4 parámetros
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  return app;
}
