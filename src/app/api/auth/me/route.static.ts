// Static fallback for GitHub Pages deployment
import { NextResponse } from 'next/server';

export async function GET() {
  // For static deployment, return a demo user
  return NextResponse.json({
    user: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'USER'
    }
  });
}
