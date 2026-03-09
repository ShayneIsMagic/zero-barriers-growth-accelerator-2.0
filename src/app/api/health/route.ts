import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const {
      isOllamaAvailable,
      getOllamaConfigurationIssue,
    } = await import('@/lib/ollama-analysis');
    const ollamaAvailable = await isOllamaAvailable();
    const ollamaBaseUrl =
      process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    const ollamaConfigurationIssue = getOllamaConfigurationIssue();

    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'healthy',
        database: 'unknown', // Could add database health check here
        ai: ollamaAvailable ? 'healthy' : 'unhealthy',
        ollama: {
          available: ollamaAvailable,
          baseUrl: ollamaBaseUrl,
          model: ollamaModel,
          configurationIssue: ollamaConfigurationIssue,
        },
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
