import { NextRequest, NextResponse } from 'next/server';
import { DemoAuthService } from '@/lib/demo-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    // For demo purposes, create a new demo user
    const user = await DemoAuthService.signUp(email, password, name);
    
    if (!user) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // In a real app, you'd generate a JWT token here
    const token = 'demo-token-' + Date.now();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      message: 'Sign up successful'
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}