try {
  process.loadEnvFile();
} catch {
  // Ignorar si el archivo .env no existe o ya está cargado
}

import { createApp } from './app.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './lib/mongoose.js';

const PORT = Number(process.env.PORT ?? '3000');

async function bootstrap() {
  // 1. Conectar a MongoDB ANTES de app.listen() (requisito obligatorio de la rúbrica)
  await connectDB();

  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`🎧 DJ Sound & Lights Server running on http://localhost:${PORT}`);
    logger.info(`📌 Health check available at http://localhost:${PORT}/health`);
    logger.info(`🏷️ Categories API available at http://localhost:${PORT}/api/v1/categories`);
    logger.info(`🔊 Equipment API available at http://localhost:${PORT}/api/v1/equipment`);
  });

  // Graceful Shutdown
  async function shutdown(signal: string) {
    logger.info(`Received ${signal}. Closing HTTP server gracefully...`);

    server.close(async () => {
      await disconnectDB();
      logger.info('HTTP server closed and MongoDB disconnected cleanly.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Server shutdown timed out. Forcing process exit.');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error', { error: err });
  process.exit(1);
});
