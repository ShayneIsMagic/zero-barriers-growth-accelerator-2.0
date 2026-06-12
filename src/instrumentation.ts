import { logger } from '@/lib/logger';

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing: string[] = [];

  if (!process.env.NEXTAUTH_SECRET) {
    missing.push('NEXTAUTH_SECRET');
  }
  if (!process.env.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  if (missing.length > 0) {
    // Do not crash serverless handlers — scraping/compare routes must work on preview deploys.
    logger.warn(
      `[instrumentation] Missing production environment variables: ${missing.join(', ')}. ` +
        'Auth and database-backed features may fail until these are set in Vercel.'
    );
  }

  if (process.env.TEST_MODE === 'true') {
    throw new Error('TEST_MODE must not be enabled in production');
  }
}
