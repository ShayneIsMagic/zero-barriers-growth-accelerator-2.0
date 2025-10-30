import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is available
const isDatabaseConfigured = !!process.env.DATABASE_URL;

// Create Prisma client only if database is configured
export const prisma = isDatabaseConfigured
  ? globalForPrisma.prisma ?? new PrismaClient()
  : (null as unknown as PrismaClient);

if (process.env.NODE_ENV !== 'production' && isDatabaseConfigured) {
  globalForPrisma.prisma = prisma as PrismaClient;
}

// Graceful shutdown (only if configured)
if (isDatabaseConfigured && prisma) {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Helper to check if Prisma is available
export const isPrismaAvailable = (): boolean => {
  return isDatabaseConfigured && prisma !== null;
};

export default prisma;
