import { analyzeWithOllama, isOllamaAvailable } from '@/lib/ollama-analysis';
import googleToolsRules from '@/lib/ai-engines/assessment-rules/google-tools-rules.json';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

interface GoogleToolsOllamaRequest {
  url: string;
  keywords?: string[];
  toolType?: string;
  manualData?: string;
  scrapedData?: Record<string, unknown>;
}

function truncateText(input: string, maxLength: number = 4000): string {
  if (!input) return '';
  return input.length > maxLength ? `${input.slice(0, maxLength)}...` : input;
}

function buildGoogleToolsPrompt(params: {
  url: string;
  keywords: string[];
  toolType?: string;
  manualData?: string;
  scrapedData?: Record<string, unknown>;
}): string {
  const { url, keywords, toolType, manualData, scrapedData } = params;
  const contextTemplate = googleToolsRules.context_template;

  const trendsData = scrapedData?.trends
    ? truncateText(JSON.stringify(scrapedData.trends, null, 2))
    : toolType === 'trends' && manualData
      ? truncateText(manualData)
      : 'No Google Trends data provided';

  const pageSpeedData = scrapedData?.pageSpeed
    ? truncateText(JSON.stringify(scrapedData.pageSpeed, null, 2))
    : toolType === 'pageSpeed' && manualData
      ? truncateText(manualData)
      : 'No PageSpeed data provided';

  const searchConsoleData = scrapedData?.searchConsole
    ? truncateText(JSON.stringify(scrapedData.searchConsole, null, 2))
    : toolType === 'searchConsole' && manualData
      ? truncateText(manualData)
      : 'No Search Console data provided';

  const analyticsData = scrapedData?.analytics
    ? truncateText(JSON.stringify(scrapedData.analytics, null, 2))
    : toolType === 'analytics' && manualData
      ? truncateText(manualData)
      : 'No Analytics data provided';

  const context = contextTemplate
    .replace('{url}', url)
    .replace('{keywords}', keywords.join(', ') || 'No keywords provided')
    .replace('{trendsData}', trendsData)
    .replace('{pageSpeedData}', pageSpeedData)
    .replace('{searchConsoleData}', searchConsoleData)
    .replace('{analyticsData}', analyticsData);

  return `${googleToolsRules.persona}

${googleToolsRules.task}

${context}

${googleToolsRules.format}

IMPORTANT:
- This is a Google tools assessment data interpretation task.
- Use the provided tool data only; do not invent metrics.
- Return valid JSON only.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GoogleToolsOllamaRequest;
    const { url, keywords = [], toolType, manualData, scrapedData } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!manualData && !scrapedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Provide either manualData or scrapedData for analysis',
        },
        { status: 400 }
      );
    }

    const ollamaReady = await isOllamaAvailable();
    if (!ollamaReady) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Ollama is not reachable. Start Ollama and ensure OLLAMA_BASE_URL is correct.',
        },
        { status: 503 }
      );
    }

    const prompt = buildGoogleToolsPrompt({
      url,
      keywords,
      toolType,
      manualData,
      scrapedData,
    });

    const analysis = await analyzeWithOllama(prompt, 'google-tools');

    return NextResponse.json({
      success: true,
      url,
      keywords,
      toolType: toolType || 'all-tools',
      analysis,
      analysisProvider: 'ollama',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Google tools Ollama analysis failed',
      },
      { status: 500 }
    );
  }
}
