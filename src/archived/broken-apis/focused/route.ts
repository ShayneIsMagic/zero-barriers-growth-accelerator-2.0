import { NextRequest, NextResponse } from 'next/server';
import { FocusedAnalysisService } from '@/lib/services/focused-analysis.service';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { _url, analysisType, analysisId, industry } = body;

    if (!url || !analysisType) {
      return NextResponse.json({
        success: false,
        error: 'URL and analysisType are required'
      }, { status: 400 });
    }

    console.log(`🎯 Starting focused ${analysisType} analysis for: ${url}`);

    // First, get the content (simplified for now)
    const content = {
      text: `Website content for ${url}`,
      url: _url,
      title: `Analysis of ${url}`,
      description: `Focused analysis of ${url}`
    };

    let result;

    switch (analysisType) {
      case 'why':
        result = await FocusedAnalysisService.analyzeWhy(analysisId || 'focused-analysis', content, industry);
        break;
      case 'functional-elements':
        result = await FocusedAnalysisService.analyzeFunctionalElements(analysisId || 'focused-analysis', content, industry);
        break;
      case 'strategic-thinking':
        result = await FocusedAnalysisService.analyzeStrategicThinking(analysisId || 'focused-analysis', content, industry);
        break;
      case 'table-stakes':
        result = await FocusedAnalysisService.analyzeTableStakes(analysisId || 'focused-analysis', content, industry);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analysisType. Must be: why, functional-elements, strategic-thinking, or table-stakes'
        }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Analysis failed'
      }, { status: 500 });
    }

    console.log(`✅ Focused ${analysisType} analysis completed`);

    return NextResponse.json({
      success: true,
      analysisType,
      data: result.data,
      message: `Focused ${analysisType} analysis completed successfully`
    });

  } catch (error) {
    console.error('Focused analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Focused analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
