/**
 * Golden Circle Analysis API
 * Uses unified AI analysis service with content-comparison approach
 */

import { AnalysisFramework, UnifiedAIAnalysisService } from '@/lib/shared/unified-ai-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for AI analysis

// Golden Circle framework definition
const GOLDEN_CIRCLE_FRAMEWORK: AnalysisFramework = {
  name: 'Golden Circle',
  description: 'Analyze content using Simon Sinek\'s Golden Circle framework: Why (purpose), How (process), What (product/service)',
  elements: [
    'why_purpose', 'why_belief', 'why_cause', 'why_inspiration',
    'how_process', 'how_methodology', 'how_differentiation', 'how_values',
    'what_product', 'what_service', 'what_features', 'what_benefits'
  ],
  categories: {
    why: ['why_purpose', 'why_belief', 'why_cause', 'why_inspiration'],
    how: ['how_process', 'how_methodology', 'how_differentiation', 'how_values'],
    what: ['what_product', 'what_service', 'what_features', 'what_benefits']
  },
  analysisType: 'golden-circle'
};

export async function POST(request: NextRequest) {
  try {
    const { url, proposedContent } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // Use the unified AI analysis service
    const result = await UnifiedAIAnalysisService.runAnalysis(
      GOLDEN_CIRCLE_FRAMEWORK,
      url,
      proposedContent
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        ...result.data,
        message: 'Golden Circle analysis completed successfully using unified AI analysis service'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Golden Circle analysis failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Golden Circle API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Golden Circle analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
