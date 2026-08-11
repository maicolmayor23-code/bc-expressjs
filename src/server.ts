import { createApp } from './app.js';

const PORT = Number(process.env.PORT ?? '3000');
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🎧 DJ Sound & Lights Server running on http://localhost:${PORT}`);
  console.log(`📌 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔊 Equipment API available at http://localhost:${PORT}/api/v1/equipment`);
});

// Implementación de Graceful Shutdown
function shutdown(signal: string) {
  console.log(`\n⚠️  Received ${signal}. Closing HTTP server gracefully...`);

  server.close(() => {
    console.log('✅ HTTP server closed. Process exiting cleanly.');
    process.exit(0);
  });

  // Forzar salida si el servidor tarda demasiado en cerrar
  setTimeout(() => {
    console.error('❌ Server shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
