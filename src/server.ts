import { createApp } from './app.js';
import { logger } from './config/logger.js';

const PORT = Number(process.env.PORT ?? '3000');
const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`🎧 DJ Sound & Lights Server running on http://localhost:${PORT}`);
  logger.info(`📌 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🔊 Equipment API available at http://localhost:${PORT}/api/v1/equipment`);
});

// Implementación de Graceful Shutdown con Winston
function shutdown(signal: string) {
  logger.info(`Received ${signal}. Closing HTTP server gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed. Process exiting cleanly.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Server shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
