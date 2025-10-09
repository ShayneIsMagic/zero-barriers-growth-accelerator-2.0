import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token (in production, you'd store this and send email)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // TODO: In production:
    // 1. Store resetToken and resetTokenExpiry in database
    // 2. Send email with reset link containing token
    // 3. Create a /reset-password page that accepts token
    
    // For now, return success (in production, always return same message)
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      // TODO: Remove this in production
      debug: process.env.NODE_ENV === 'development' ? {
        token: resetToken,
        expiry: resetTokenExpiry
      } : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

