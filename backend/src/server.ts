import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[DWH-API] Digital Wellness Hub API server running on port ${env.PORT}`);
  console.log(`[DWH-API] Environment: ${env.NODE_ENV}`);
  console.log(`[DWH-API] Health check available at: http://localhost:${env.PORT}/api/v1/health`);
});

// Graceful shutdown handling
let isShuttingDown = false;

async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[DWH-API] Received ${signal}. Initiating graceful shutdown...`);

  // Close HTTP server to stop accepting new requests
  server.close(async () => {
    console.log('[DWH-API] HTTP server closed cleanly.');
    try {
      await prisma.$disconnect();
      console.log('[DWH-API] Prisma database connection closed.');
    } catch (err) {
      console.error('[DWH-API] Error disconnecting Prisma during shutdown:', err);
    }
    process.exit(0);
  });

  // Force shutdown after 10s timeout if connections hang
  setTimeout(() => {
    console.error('[DWH-API] Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
