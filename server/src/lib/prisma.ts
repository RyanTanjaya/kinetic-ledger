import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across hot reloads (tsx watch) so we don't
// exhaust the database connection pool during development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'production'
        ? ['error']
        : ['query', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
