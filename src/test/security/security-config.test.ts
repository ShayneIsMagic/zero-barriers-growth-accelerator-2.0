import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isApiAuthRequired,
  isAuthDisabled,
  isDevelopmentEnvironment,
  isProtectedApiPath,
  isPublicSignupAllowed,
} from '@/lib/security-config';

describe('security-config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires API auth in production by default', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('REQUIRE_API_AUTH', '');

    expect(isApiAuthRequired()).toBe(true);
  });

  it('allows optional API auth in development by default', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('REQUIRE_API_AUTH', '');
    vi.stubEnv('DISABLE_AUTH', '');

    expect(isApiAuthRequired()).toBe(false);
  });

  it('disables auth when DISABLE_AUTH is true in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DISABLE_AUTH', 'true');

    expect(isAuthDisabled()).toBe(true);
    expect(isApiAuthRequired()).toBe(false);
  });

  it('never disables auth in production even with DISABLE_AUTH', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('DISABLE_AUTH', 'true');

    expect(isAuthDisabled()).toBe(false);
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
