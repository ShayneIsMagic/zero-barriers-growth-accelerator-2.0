/**
 * B2B Elements of Value Analysis API
 * Uses unified AI analysis service with content-comparison approach
 */

import { AnalysisFramework, UnifiedAIAnalysisService } from '@/lib/shared/unified-ai-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for AI analysis

// B2B Elements of Value framework definition
const B2B_FRAMEWORK: AnalysisFramework = {
  name: 'B2B Elements of Value',
  description: 'Analyze business value elements across table stakes, functional, ease of doing business, individual, and inspirational categories',
  elements: [
    // Table Stakes (4 elements)
    'meeting_specifications', 'acceptable_price', 'regulatory_compliance', 'ethical_standards',
    // Functional (9 elements)
    'improved_top_line', 'cost_reduction', 'product_quality', 'scalability', 'innovation',
    'risk_reduction', 'reach', 'flexibility', 'component_quality',
    // Ease of Doing Business (17 elements)
    'time_savings', 'reduced_effort', 'decreased_hassles', 'information', 'transparency',
    'organization', 'simplification', 'connection', 'integration', 'access', 'availability',
    'variety', 'configurability', 'responsiveness', 'expertise', 'commitment', 'stability', 'cultural_fit',
    // Individual (7 elements)
    'network_expansion', 'marketability', 'reputational_assurance', 'design_aesthetics_b2b',
    'growth_development', 'reduced_anxiety_b2b', 'fun_perks',
    // Inspirational (3 elements)
    'vision', 'hope_b2b', 'social_responsibility'
  ],
  categories: {
    table_stakes: ['meeting_specifications', 'acceptable_price', 'regulatory_compliance', 'ethical_standards'],
    functional: ['improved_top_line', 'cost_reduction', 'product_quality', 'scalability', 'innovation', 'risk_reduction', 'reach', 'flexibility', 'component_quality'],
    ease_of_doing_business: ['time_savings', 'reduced_effort', 'decreased_hassles', 'information', 'transparency', 'organization', 'simplification', 'connection', 'integration', 'access', 'availability', 'variety', 'configurability', 'responsiveness', 'expertise', 'commitment', 'stability', 'cultural_fit'],
    individual: ['network_expansion', 'marketability', 'reputational_assurance', 'design_aesthetics_b2b', 'growth_development', 'reduced_anxiety_b2b', 'fun_perks'],
    inspirational: ['vision', 'hope_b2b', 'social_responsibility']
  },
  analysisType: 'b2b-elements'
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
      B2B_FRAMEWORK,
      url,
      proposedContent
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        ...result.data,
        message: 'B2B Elements of Value analysis completed successfully using unified AI analysis service'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'B2B Elements of Value analysis failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('B2B Elements of Value API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'B2B Elements of Value analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

