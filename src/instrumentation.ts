export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    const missing: string[] = [];

    if (!process.env.NEXTAUTH_SECRET) {
      missing.push('NEXTAUTH_SECRET');
    }
    if (!process.env.DATABASE_URL) {
      missing.push('DATABASE_URL');
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required production environment variables: ${missing.join(', ')}`
      );
    }

    if (process.env.TEST_MODE === 'true') {
      throw new Error('TEST_MODE must not be enabled in production');
    }
  }
}
