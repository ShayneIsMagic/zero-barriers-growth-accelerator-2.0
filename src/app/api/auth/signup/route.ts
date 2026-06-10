import { prisma } from '@/lib/prisma';
import { isPublicSignupAllowed } from '@/lib/security-config';
import { createAuthCookie } from '@/lib/server/jwt';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!isPublicSignupAllowed()) {
      return NextResponse.json(
        { error: 'Registration is disabled. Contact an administrator.' },
        { status: 403 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: 'Authentication is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: 'USER', // Default role for new signups
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      message: 'Sign up successful',
    });

    const cookie = createAuthCookie(token);
    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
