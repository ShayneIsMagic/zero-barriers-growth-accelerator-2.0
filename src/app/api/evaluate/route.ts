import { NextRequest, NextResponse } from 'next/server';
import {
  getEvaluationApiUrl,
  isFlaskEvaluationEnabledServer,
} from '@/lib/server/flask-config';

export const maxDuration = 120;

interface EvaluateProxyBody {
  frameworkKey?: string;
  payload?: Record<string, unknown>;
  persistCollection?: boolean;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isFlaskEvaluationEnabledServer()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Deterministic evaluation is disabled on this deployment',
      },
      { status: 503 }
    );
  }

  let body: EvaluateProxyBody;
  try {
    body = (await request.json()) as EvaluateProxyBody;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (!body.frameworkKey || !body.payload) {
    return NextResponse.json(
      {
        success: false,
        error: 'frameworkKey and payload are required',
      },
      { status: 400 }
    );
  }

  const baseUrl = getEvaluationApiUrl();
  const targetUrl = `${baseUrl}/api/evaluate`;

  try {
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frameworkKey: body.frameworkKey,
        payload: body.payload,
        persistCollection: body.persistCollection ?? true,
      }),
      signal: AbortSignal.timeout(110_000),
    });

    const data = (await upstream.json()) as Record<string, unknown>;

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Evaluation API unreachable',
        details:
          error instanceof Error
            ? error.message
            : `Could not reach ${baseUrl}. Start Flask: cd backend && pipenv run python app.py`,
      },
      { status: 502 }
    );
  }
}
