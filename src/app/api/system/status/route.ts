import { NextRequest, NextResponse } from 'next/server';
import { isApiAuthRequired } from '@/lib/security-config';
import { getRequestUser } from '@/lib/server/api-route';
import { checkOllamaHealth } from '@/lib/server/ollama-health';
import { isSuperAdminRole } from '@/lib/server/super-admin';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = getRequestUser(request);
  const ollama = await checkOllamaHealth();

  const payload = {
    success: true,
    api: {
      status: 'healthy',
      authRequired: isApiAuthRequired(),
      environment: process.env.NODE_ENV || 'development',
    },
    ollama,
    ai: {
      allowFallbacks: process.env.AI_ALLOW_FALLBACKS === 'true',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    },
    user: user
      ? {
          userId: user.userId,
          email: user.email,
          role: user.role,
          isSuperAdmin: isSuperAdminRole(user.role),
        }
      : null,
  };

  return NextResponse.json(payload);
}
