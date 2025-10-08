import { NextRequest, NextResponse } from 'next/server';
import { DemoAuthService } from '@/lib/demo-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // For demo purposes, authenticate with demo user
    const user = await DemoAuthService.signIn(email, password);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
      message: 'Sign in successful'
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}