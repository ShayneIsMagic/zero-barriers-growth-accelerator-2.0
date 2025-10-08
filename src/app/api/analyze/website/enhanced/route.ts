import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAIService } from '@/lib/enhanced-ai-service';
import { AIProvider } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const { url, provider = 'openai' } = await request.json();

    if (!url || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders: AIProvider[] = ['openai', 'gemini', 'claude'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid AI provider' },
        { status: 400 }
      );
    }

    // Perform analysis with selected provider
    const analysisResult = await EnhancedAIService.analyzeWebsite(url, provider);

    // Return analysis result
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      provider: provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Enhanced website analysis error:', error);

    if (error instanceof Error) {
      if (error.message.includes('AI analysis failed')) {
        return NextResponse.json(
          {
            error: 'AI analysis service temporarily unavailable. Please try again later.',
            details: error.message,
          },
          { status: 503 }
        );
      }
      if (error.message.includes('Failed to fetch website')) {
        return NextResponse.json(
          {
            error: 'Unable to access the website. Please check the URL and try again.',
            details: error.message,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const availableProviders = EnhancedAIService.getAvailableProviders();
    const providerInfo = EnhancedAIService.getProviderInfo();

    return NextResponse.json({
      success: true,
      availableProviders,
      providers: providerInfo,
    });
  } catch (error) {
    console.error('Error getting provider info:', error);
    return NextResponse.json(
      {
        error: 'Failed to get provider information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
