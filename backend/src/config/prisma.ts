import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prismaClientGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaClientGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.prismaClientGlobal = prisma;
}

/**
 * Validates active database connectivity.
 * Uses a lightweight SELECT 1 query against PostgreSQL.
 * Does not expose raw internal error strings to callers.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return true;
  } catch (error: unknown) {
    // Log internally on server without exposing credentials or internal details to API consumers
    console.error('[Database Check] Connectivity check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
