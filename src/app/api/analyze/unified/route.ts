import { UnifiedAnalysisService } from '@/lib/services/unified-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for multiple analyses

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, options } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🌐 Starting unified analysis for: ${url}`);

    // Run unified analysis
    const result = await UnifiedAnalysisService.analyzeWebsite(url, options || {});

    if (result.success) {
      console.log(`✅ Unified analysis completed for: ${url}`);
      console.log(`📊 Completed analyses: ${result.completedAnalyses.join(', ')}`);

      // Generate comprehensive report
      const report = UnifiedAnalysisService.generateComprehensiveReport(result);

      return NextResponse.json({
        success: true,
        data: result,
        report
      });
    } else {
      console.error(`❌ Unified analysis failed for: ${url}`);
      return NextResponse.json({
        success: false,
        error: 'All analyses failed',
        details: result.errors
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unified analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unified analysis failed'
    }, { status: 500 });
  }
}
