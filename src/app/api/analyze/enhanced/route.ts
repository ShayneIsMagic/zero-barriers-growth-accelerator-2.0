/**
 * Enhanced Analysis API
 * Uses actual framework knowledge for better analysis
 */

import { EnhancedAnalysisService } from '@/lib/ai-engines/enhanced-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for enhanced analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { _url, scrapedData, assessmentType } = body;

    if (!_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
        },
        { status: 400 }
      );
    }

    if (!scrapedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scraped data is required',
        },
        { status: 400 }
      );
    }

    if (!assessmentType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment type is required',
        },
        { status: 400 }
      );
    }

    console.log(`🧠 Starting enhanced analysis for: ${_url}`);
    console.log(`📊 Assessment type: ${assessmentType}`);

    // Run enhanced analysis with framework knowledge
    const result = await EnhancedAnalysisService.analyzeWithFramework(
      assessmentType,
      scrapedData,
      _url
    );

    if (result.success) {
      console.log(`✅ Enhanced analysis completed for: ${_url}`);
      console.log(`🎯 Framework used: ${result.frameworkUsed}`);
      console.log(`📈 Validation score: ${result.validation.score}`);

      return NextResponse.json({
        success: true,
        _url,
        assessmentType,
        frameworkUsed: result.frameworkUsed,
        analysis: result.analysis,
        validation: result.validation,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error(`❌ Enhanced analysis failed for: ${_url}`, result.error);

      return NextResponse.json(
        {
          success: false,
          _url,
          assessmentType,
          frameworkUsed: result.frameworkUsed,
          error: result.error,
          validation: result.validation,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Enhanced analysis API error:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Enhanced analysis failed',
        details: 'Failed to run enhanced analysis with framework knowledge',
      },
      { status: 500 }
    );
  }
}

/**
 * Test framework integration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentType =
      searchParams.get('assessmentType') || 'golden-circle';

    console.log(`🧪 Testing framework integration for: ${assessmentType}`);

    const testResult =
      await EnhancedAnalysisService.testFrameworkIntegration(assessmentType);

    return NextResponse.json({
      success: true,
      assessmentType,
      ...testResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Framework integration test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Framework test failed',
      },
      { status: 500 }
    );
  }
}
