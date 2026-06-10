import { AUTH_COOKIE_NAME } from '@/lib/security-config';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });

  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
