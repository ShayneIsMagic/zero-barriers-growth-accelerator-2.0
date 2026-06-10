import { isProductionEnvironment } from '@/lib/security-config';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    if (isProductionEnvironment()) {
      return NextResponse.json({ status: 'healthy' }, { status: 200 });
    }

    const {
      isOllamaAvailable,
      getOllamaConfigurationIssue,
    } = await import('@/lib/ollama-analysis');
    const ollamaAvailable = await isOllamaAvailable();
    const ollamaBaseUrl =
      process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const ollamaPublicUrl = process.env.OLLAMA_PUBLIC_URL || null;
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    const ollamaConfigurationIssue = getOllamaConfigurationIssue();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'healthy',
        database: 'unknown',
        ai: ollamaAvailable ? 'healthy' : 'unhealthy',
        ollama: {
          available: ollamaAvailable,
          baseUrl: ollamaBaseUrl,
          publicUrl: ollamaPublicUrl,
          model: ollamaModel,
          configurationIssue: ollamaConfigurationIssue,
        },
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch {
    return NextResponse.json({ status: 'unhealthy' }, { status: 500 });
  }
}
