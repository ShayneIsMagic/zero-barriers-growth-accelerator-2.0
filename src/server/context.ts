import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

interface CreateContextOptions {
  headers: Headers;
}

export interface Context {
  prisma: typeof prisma;
  user: any | null;
}

export async function createContext(
  opts: CreateContextOptions
): Promise<Context> {
  // Get auth token from headers
  const authHeader = opts.headers.get('authorization');
  let user = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await AuthService.verifyToken(token);
    if (payload) {
      user = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    }
  }

  return {
    prisma,
    user,
  };
}
