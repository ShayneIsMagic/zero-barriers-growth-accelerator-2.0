import { NextRequest, NextResponse } from 'next/server';
import { FocusedAnalysisService } from '@/lib/services/focused-analysis.service';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content, industry } = body;

    if (!url || !content) {
      return NextResponse.json({
        success: false,
        error: 'URL and content are required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting simple Phase 2 AI analysis for: ${url}`);

    // Run focused analyses in parallel
    const [whyAnalysis, functionalAnalysis, strategicAnalysis, tableStakesAnalysis] = await Promise.all([
      FocusedAnalysisService.analyzeWhy('phase2-analysis', content, industry),
      FocusedAnalysisService.analyzeFunctionalElements('phase2-analysis', content, industry),
      FocusedAnalysisService.analyzeStrategicThinking('phase2-analysis', content, industry),
      FocusedAnalysisService.analyzeTableStakes('phase2-analysis', content, industry)
    ]);

    // Compile results
    const results = {
      goldenCircle: {
        why: whyAnalysis.success ? whyAnalysis.data : null,
        error: whyAnalysis.error
      },
      elementsOfValue: {
        functional: functionalAnalysis.success ? functionalAnalysis.data : null,
        error: functionalAnalysis.error
      },
      cliftonStrengths: {
        strategicThinking: strategicAnalysis.success ? strategicAnalysis.data : null,
        error: strategicAnalysis.error
      },
      b2bElements: {
        tableStakes: tableStakesAnalysis.success ? tableStakesAnalysis.data : null,
        error: tableStakesAnalysis.error
      }
    };

    console.log(`✅ Phase 2 completed - AI analysis results compiled`);

    return NextResponse.json({
      success: true,
      url,
      data: results,
      message: 'Simple Phase 2 AI analysis completed.'
    });

  } catch (error) {
    console.error('Simple Phase 2 execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Simple Phase 2 AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
