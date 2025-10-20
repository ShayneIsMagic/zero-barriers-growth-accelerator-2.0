/**
 * CliftonStrengths Analysis API
 * Uses unified AI analysis service with content-comparison approach
 */

import { AnalysisFramework, UnifiedAIAnalysisService } from '@/lib/shared/unified-ai-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for AI analysis

// CliftonStrengths framework definition
const CLIFTON_STRENGTHS_FRAMEWORK: AnalysisFramework = {
  name: 'CliftonStrengths',
  description: 'Analyze content using Gallup\'s CliftonStrengths framework to identify dominant themes and strengths',
  elements: [
    'achiever', 'activator', 'adaptability', 'analytical', 'arranger', 'belief', 'command', 'communication',
    'competition', 'connectedness', 'consistency', 'context', 'deliberative', 'developer', 'discipline',
    'empathy', 'focus', 'futuristic', 'harmony', 'ideation', 'includer', 'individualization', 'input',
    'intellection', 'learner', 'maximizer', 'positivity', 'relator', 'responsibility', 'restorative',
    'self_assurance', 'significance', 'strategic', 'woo'
  ],
  categories: {
    executing: ['achiever', 'arranger', 'belief', 'consistency', 'deliberative', 'discipline', 'focus', 'responsibility', 'restorative'],
    influencing: ['activator', 'command', 'communication', 'competition', 'maximizer', 'self_assurance', 'significance', 'woo'],
    relationship_building: ['adaptability', 'connectedness', 'developer', 'empathy', 'harmony', 'includer', 'individualization', 'positivity', 'relator'],
    strategic_thinking: ['analytical', 'context', 'futuristic', 'ideation', 'input', 'intellection', 'learner', 'strategic']
  },
  analysisType: 'clifton-strengths'
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
      CLIFTON_STRENGTHS_FRAMEWORK,
      url,
      proposedContent
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        ...result.data,
        message: 'CliftonStrengths analysis completed successfully using unified AI analysis service'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'CliftonStrengths analysis failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('CliftonStrengths API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'CliftonStrengths analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
