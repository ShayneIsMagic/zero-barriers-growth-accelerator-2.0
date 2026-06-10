import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }
  return secret;
}

function normalizePayload(
  decoded: Record<string, unknown>
): AuthTokenPayload | null {
  const userId =
    typeof decoded.userId === 'string'
      ? decoded.userId
      : typeof decoded.id === 'string'
        ? decoded.id
        : null;

  if (
    !userId ||
    typeof decoded.email !== 'string' ||
    typeof decoded.role !== 'string'
  ) {
    return null;
  }

  return {
    userId,
    email: decoded.email,
    role: decoded.role,
  };
}

/** Verify JWT in Node.js API route handlers (jsonwebtoken). */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as Record<string, unknown>;
    return normalizePayload(decoded);
  } catch {
    return null;
  }
}

/** Verify JWT in Edge middleware (jose). */
export async function verifyAuthTokenEdge(
  token: string
): Promise<AuthTokenPayload | null> {
  if (!process.env.NEXTAUTH_SECRET) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return normalizePayload(payload as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function createAuthCookie(token: string): {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  maxAge: number;
  path: string;
} {
  return {
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  };
}
