import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  isAuthEnforced,
  isDevelopmentEnvironment,
  isProtectedApiPath,
  isRateLimitedAuthPath,
} from '@/lib/security-config';
import { verifyAuthTokenEdge } from '@/lib/server/jwt';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { isSuperAdminRole } from '@/lib/super-admin-utils';

const AUTH_RATE_LIMIT = 10;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

function isTestApiPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/test-') || pathname === '/api/debug-user'
  );
}

function isTestPagePath(pathname: string): boolean {
  return pathname === '/test' || pathname === '/test-login';
}

function unauthorizedApiResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Authentication required' },
    { status: 401 }
  );
}

async function resolveToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return cookieToken ?? null;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isTestPagePath(pathname) && !isDevelopmentEnvironment()) {
    const token = await resolveToken(request);
    const payload = token ? await verifyAuthTokenEdge(token) : null;
    if (!payload || !isSuperAdminRole(payload.role)) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (isTestApiPath(pathname) && !isDevelopmentEnvironment()) {
    const token = await resolveToken(request);
    const payload = token ? await verifyAuthTokenEdge(token) : null;
    if (!payload || !isSuperAdminRole(payload.role)) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (isRateLimitedAuthPath(pathname) && request.method === 'POST') {
    const ip = getClientIp(request);
    const limit = checkRateLimit({
      key: `auth:${pathname}:${ip}`,
      limit: AUTH_RATE_LIMIT,
      windowMs: AUTH_WINDOW_MS,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds),
          },
        }
      );
    }
  }

  const authEnforced = isAuthEnforced();
  const workspaceProtected = pathname.startsWith('/workspace') && authEnforced;
  const dashboardProtected =
    pathname.startsWith('/dashboard') && authEnforced;
  const apiProtected = isProtectedApiPath(pathname) && authEnforced;

  if (workspaceProtected || dashboardProtected || apiProtected) {
    const token = await resolveToken(request);

    if (!token) {
      if (workspaceProtected || dashboardProtected) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
      return unauthorizedApiResponse();
    }

    const payload = await verifyAuthTokenEdge(token);
    if (!payload) {
      if (workspaceProtected || dashboardProtected) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        const response = NextResponse.redirect(signInUrl);
        response.cookies.delete(AUTH_COOKIE_NAME);
        return response;
      }
      return unauthorizedApiResponse();
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/workspace',
    '/workspace/:path*',
    '/dashboard/:path*',
    '/test',
    '/test-login',
    '/api/analyze/:path*',
    '/api/scrape/:path*',
    '/api/scrape-:path*',
    '/api/content/:path*',
    '/api/reports/:path*',
    '/api/analysis/:path*',
    '/api/generate-:path*',
    '/api/tools/:path*',
    '/api/test-:path*',
    '/api/debug-user',
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/auth/forgot-password',
  ],
};
