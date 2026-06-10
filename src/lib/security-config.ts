/**
 * Edge-safe security configuration shared by middleware and API routes.
 */

export const AUTH_COOKIE_NAME = 'auth_token';

/** API prefixes that require authentication when auth is enforced. */
export const PROTECTED_API_PREFIXES = [
  '/api/analyze/',
  '/api/scrape/',
  '/api/scrape-',
  '/api/content/',
  '/api/reports',
  '/api/analysis',
  '/api/generate-',
  '/api/tools/',
] as const;

/** Auth endpoints subject to rate limiting. */
export const RATE_LIMITED_AUTH_PATHS = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/forgot-password',
] as const;

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  );
}

/**
 * Local testing only — skips JWT on pages and APIs. Never applies in production.
 */
export function isAuthDisabled(): boolean {
  if (isProductionEnvironment()) {
    return false;
  }
  if (process.env.DISABLE_AUTH === 'true') {
    return true;
  }
  return false;
}

/**
 * Client-visible mirror of DISABLE_AUTH (set NEXT_PUBLIC_DISABLE_AUTH=true in .env.local).
 */
export function isClientAuthDisabled(): boolean {
  return process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';
}

/**
 * When true, protected API routes and pages require a valid JWT.
 * Defaults to required in production; optional in local development.
 */
export function isApiAuthRequired(): boolean {
  if (isAuthDisabled()) {
    return false;
  }
  if (process.env.REQUIRE_API_AUTH === 'true') {
    return true;
  }
  if (process.env.REQUIRE_API_AUTH === 'false') {
    return false;
  }
  return isProductionEnvironment();
}

/** Pages (/workspace, /dashboard) and APIs use the same enforcement flag. */
export function isAuthEnforced(): boolean {
  return isApiAuthRequired();
}

/**
 * Public self-service signup. Disabled in production unless explicitly enabled.
 */
export function isPublicSignupAllowed(): boolean {
  if (process.env.ALLOW_PUBLIC_SIGNUP === 'true') {
    return true;
  }
  if (process.env.ALLOW_PUBLIC_SIGNUP === 'false') {
    return false;
  }
  return !isProductionEnvironment();
}

/**
 * Test/debug routes are never enabled in production, even with TEST_MODE.
 */
export function isDevelopmentEnvironment(): boolean {
  if (isProductionEnvironment()) {
    return false;
  }
  return (
    process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true'
  );
}

export function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isRateLimitedAuthPath(pathname: string): boolean {
  return RATE_LIMITED_AUTH_PATHS.some((path) => pathname === path);
}
