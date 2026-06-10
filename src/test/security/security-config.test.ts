import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isApiAuthRequired,
  isAuthDisabled,
  isClientAuthDisabled,
  isDevelopmentEnvironment,
  isProtectedApiPath,
  isPublicSignupAllowed,
} from '@/lib/security-config';

describe('security-config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires API auth only when explicitly enabled in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('REQUIRE_API_AUTH', '');
    vi.stubEnv('ENABLE_AUTH', '');
    vi.stubEnv('DISABLE_AUTH', '');

    expect(isApiAuthRequired()).toBe(false);
  });

  it('requires API auth when ENABLE_AUTH is true in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('ENABLE_AUTH', 'true');

    expect(isAuthDisabled()).toBe(false);
    expect(isApiAuthRequired()).toBe(true);
  });

  it('disables auth by default in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('REQUIRE_API_AUTH', '');
    vi.stubEnv('ENABLE_AUTH', '');
    vi.stubEnv('DISABLE_AUTH', '');

    expect(isAuthDisabled()).toBe(true);
    expect(isApiAuthRequired()).toBe(false);
  });

  it('disables auth in production by default until ENABLE_AUTH', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('ENABLE_AUTH', '');
    vi.stubEnv('DISABLE_AUTH', '');

    expect(isAuthDisabled()).toBe(true);
    expect(isApiAuthRequired()).toBe(false);
  });

  it('honors DISABLE_AUTH=false to require auth', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DISABLE_AUTH', 'false');

    expect(isAuthDisabled()).toBe(false);
    expect(isApiAuthRequired()).toBe(false);
  });

  it('reflects NEXT_PUBLIC_DISABLE_AUTH on the client', () => {
    vi.stubEnv('NEXT_PUBLIC_DISABLE_AUTH', 'true');
    expect(isClientAuthDisabled()).toBe(true);

    vi.stubEnv('NEXT_PUBLIC_DISABLE_AUTH', 'false');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_AUTH', '');
    expect(isClientAuthDisabled()).toBe(false);
  });

  it('disables public signup in production by default', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('ALLOW_PUBLIC_SIGNUP', '');

    expect(isPublicSignupAllowed()).toBe(false);
  });

  it('never treats production as development even with TEST_MODE', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('TEST_MODE', 'true');

    expect(isDevelopmentEnvironment()).toBe(false);
  });

  it('identifies protected API prefixes', () => {
    expect(isProtectedApiPath('/api/analyze/golden-circle-standalone')).toBe(
      true
    );
    expect(isProtectedApiPath('/api/content/collect')).toBe(true);
    expect(isProtectedApiPath('/api/auth/signin')).toBe(false);
  });
});
