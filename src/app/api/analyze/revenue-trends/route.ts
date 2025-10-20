/**
 * Revenue Trends Analysis API
 * Uses unified AI analysis service with content-comparison approach
 */

import { AnalysisFramework, UnifiedAIAnalysisService } from '@/lib/shared/unified-ai-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

// Revenue Trends framework definition
const REVENUE_TRENDS_FRAMEWORK: AnalysisFramework = {
  name: 'Revenue Trends',
  description: 'Analyze content for revenue opportunities, market trends, and growth potential using data-driven insights',
  elements: [
    'market_demand', 'trending_keywords', 'seasonal_patterns', 'competitor_gaps',
    'emerging_opportunities', 'price_sensitivity', 'customer_segments', 'conversion_potential',
    'upsell_opportunities', 'cross_sell_potential', 'retention_strategies', 'expansion_opportunities',
    'partnership_potential', 'content_gaps', 'seo_opportunities', 'social_media_trends'
  ],
  categories: {
    market_analysis: ['market_demand', 'trending_keywords', 'seasonal_patterns', 'competitor_gaps'],
    opportunity_identification: ['emerging_opportunities', 'price_sensitivity', 'customer_segments', 'conversion_potential'],
    revenue_optimization: ['upsell_opportunities', 'cross_sell_potential', 'retention_strategies', 'expansion_opportunities'],
    growth_strategies: ['partnership_potential', 'content_gaps', 'seo_opportunities', 'social_media_trends']
  },
  analysisType: 'revenue-trends'
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
      REVENUE_TRENDS_FRAMEWORK,
      url,
      proposedContent
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        ...result.data,
        message: 'Revenue Trends analysis completed successfully using unified AI analysis service'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Revenue Trends analysis failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Revenue Trends API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Revenue Trends analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
