import { NextRequest, NextResponse } from 'next/server';
import { isApiAuthRequired } from '@/lib/security-config';
import { getRequestUser } from '@/lib/server/api-route';
import { checkFlaskHealth } from '@/lib/server/flask-health';
import { getDefaultAnalysisEngine } from '@/lib/server/analysis-engine-config';
import { checkOllamaHealth } from '@/lib/server/ollama-health';
import { isSuperAdminRole } from '@/lib/server/super-admin';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = getRequestUser(request);
  const [ollama, flask] = await Promise.all([
    checkOllamaHealth(),
    checkFlaskHealth(),
  ]);

  const payload = {
    success: true,
    api: {
      status: 'healthy',
      authRequired: isApiAuthRequired(),
      environment: process.env.NODE_ENV || 'development',
    },
    ollama,
    evaluation: {
      flask,
      defaultEngine: getDefaultAnalysisEngine(),
      /** Prefer deterministic scoring when AI is down and Flask is healthy. */
      preferDeterministic:
        flask.status === 'healthy' &&
        (ollama.status === 'unreachable' ||
          ollama.status === 'not_configured' ||
          ollama.status === 'model_missing'),
    },
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
