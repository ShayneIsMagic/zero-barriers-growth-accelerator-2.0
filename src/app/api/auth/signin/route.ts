import { USER_ROLES } from '@/constants';
import { prisma } from '@/lib/prisma';
import { createAuthCookie } from '@/lib/server/jwt';
import { isConfiguredSuperAdminEmail } from '@/lib/server/super-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

function missingSecretResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Authentication is not configured' },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!JWT_SECRET) {
      return missingSecretResponse();
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    let effectiveRole = user.role || USER_ROLES.USER;
    if (isConfiguredSuperAdminEmail(user.email)) {
      effectiveRole = USER_ROLES.SUPER_ADMIN;
      if (user.role !== USER_ROLES.SUPER_ADMIN) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: USER_ROLES.SUPER_ADMIN },
        });
      }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: effectiveRole,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
      },
      token,
      message: 'Sign in successful',
    });

    const cookie = createAuthCookie(token);
    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
