import 'server-only';

import { getEvaluationApiUrl, isFlaskEvaluationEnabledServer } from '@/lib/server/flask-config';

export interface FlaskHealthResult {
  enabled: boolean;
  status: 'healthy' | 'unreachable' | 'disabled' | 'not_configured';
  baseUrl: string;
  message: string;
}

export async function checkFlaskHealth(): Promise<FlaskHealthResult> {
  const baseUrl = getEvaluationApiUrl();

  if (!isFlaskEvaluationEnabledServer()) {
    return {
      enabled: false,
      status: 'disabled',
      baseUrl,
      message: 'Flask evaluation is disabled (ENABLE_FLASK_EVALUATION=false)',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        enabled: true,
        status: 'unreachable',
        baseUrl,
        message: `Evaluation API returned HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      status?: string;
    };

    if (data.success === true || data.status === 'healthy') {
      return {
        enabled: true,
        status: 'healthy',
        baseUrl,
        message: 'Deterministic evaluation API is ready',
      };
    }

    return {
      enabled: true,
      status: 'unreachable',
      baseUrl,
      message: 'Evaluation API health check failed',
    };
  } catch (error) {
    return {
      enabled: true,
      status: 'unreachable',
      baseUrl,
      message:
        error instanceof Error
          ? error.message
          : 'Evaluation API unreachable — start Flask on port 5001',
    };
  }
}
