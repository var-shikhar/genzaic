/**
 * Prisma Database Client Configuration
 * Singleton instance with query logging in development
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with logging configuration
const createPrismaClient = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const prisma = new PrismaClient({
    log: isDevelopment
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ]
      : [
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
  });

  // Log queries in development mode
  if (isDevelopment) {
    prisma.$on('query' as never, (e: any) => {
      logger.debug(`Query: ${e.query}`);
      logger.debug(`Params: ${e.params}`);
      logger.debug(`Duration: ${e.duration}ms`);
    });
  }

  // Log errors
  prisma.$on('error' as never, (e: any) => {
    logger.error('Prisma Error:', e);
  });

  // Log warnings
  prisma.$on('warn' as never, (e: any) => {
    logger.warn('Prisma Warning:', e);
  });

  return prisma;
};

// Use singleton pattern to prevent multiple instances in development (hot reload)
export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});

export default prisma;
