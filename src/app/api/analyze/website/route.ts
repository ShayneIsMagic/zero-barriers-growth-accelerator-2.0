import {
  performRealAnalysis,
  testAPIConnectivity,
} from '@/lib/free-ai-analysis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const analyzeWebsiteSchema = z.object({
  url: z.string().url('Invalid URL format'),
  analysisType: z.enum(['full', 'quick', 'social-media']).default('full'),
});

// REAL AI ANALYSIS ONLY - NO DEMO DATA ALLOWED
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = analyzeWebsiteSchema.parse(body);

    console.log(
      `Received analysis request for URL: ${validatedData.url} with type: ${validatedData.analysisType}`
    );

    // Test API connectivity first
    const connectivity = await testAPIConnectivity();
    console.log('API Connectivity:', connectivity);

    // REQUIRE real AI APIs - NO demo data allowed
    if (!connectivity.gemini && !connectivity.claude) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI_SERVICE_UNAVAILABLE',
          message: 'No AI services available. Real AI analysis required.',
          details:
            'Please run "npm run setup:ai" to configure AI services. Demo data is not allowed.',
        },
        { status: 503 }
      );
    }

    // ONLY use real AI analysis - no fallbacks to demo data
    console.log('Performing REAL AI analysis only...');
    const analysisResult = await performRealAnalysis(
      validatedData.url,
      validatedData.analysisType
    );

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Website analysis completed successfully',
    });
  } catch (error) {
    console.error('Website analysis error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'ANALYSIS_FAILED',
        message: 'Website analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'connectivity':
        const connectivity = await testAPIConnectivity();
        return NextResponse.json({
          success: true,
          connectivity,
        });

      case 'info':
        return NextResponse.json({
          success: true,
          data: {
            name: 'Website Analysis API',
            version: '1.0.0',
            description: 'Real AI-powered website analysis with no demo data',
            endpoints: {
              'POST /api/analyze/website': 'Analyze website with real AI',
              'GET /api/analyze/website?action=connectivity':
                'Check AI service connectivity',
              'GET /api/analyze/website?action=info': 'Get API information',
            },
            features:
              'Real AI analysis only, no demo data, comprehensive content analysis, actionable recommendations',
          },
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Website Analysis API is ready',
            endpoints: {
              'POST /api/analyze/website': 'Analyze website with real AI',
              'GET /api/analyze/website?action=connectivity':
                'Check AI service connectivity',
              'GET /api/analyze/website?action=info': 'Get API information',
            },
            note: 'Real AI analysis only - no demo data available',
          },
        });
    }
  } catch (error) {
    console.error('Website analysis GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
