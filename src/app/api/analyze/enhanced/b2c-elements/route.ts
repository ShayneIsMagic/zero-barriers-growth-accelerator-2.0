/**
 * Enhanced B2C Elements Analysis API
 * Uses comparison data for better scoring and recommendations
 */

import { ElementsOfValueB2CService } from '@/lib/services/elements-value-b2c.service';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scrapedContent, comparisonData: _comparisonData } = body;

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
        },
        { status: 400 }
      );
    }

    if (!scrapedContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scraped content is required',
        },
        { status: 400 }
      );
    }

    console.log(
      `💰 Starting ENHANCED B2C Elements of Value analysis for: ${url}`
    );

    const analysisId = uuidv4();

    // Normalize scraped content format
    let normalizedContent;
    if (typeof scrapedContent === 'string') {
      normalizedContent = {
        title: url.split('/')[2] || 'Website',
        cleanText: scrapedContent,
      };
    } else {
      normalizedContent = scrapedContent;
    }

    // Run enhanced analysis with comparison context
    const analysis = await ElementsOfValueB2CService.analyze(
      analysisId,
      normalizedContent,
      'general',
      []
    );

    // Enhance with comparison data if provided
    const enhancedAnalysis = _comparisonData
      ? enhanceWithComparisonData(analysis, _comparisonData)
      : analysis;

    console.log(
      `✅ ENHANCED B2C Elements of Value analysis completed for: ${url}`
    );

    const frontendData = {
      overall_score: enhancedAnalysis.overall_score,
      functional_score: enhancedAnalysis.functional_score,
      emotional_score: enhancedAnalysis.emotional_score,
      life_changing_score: enhancedAnalysis.life_changing_score,
      social_impact_score: enhancedAnalysis.social_impact_score,
      categories: {
        functional: {
          score: enhancedAnalysis.functional_score,
          elements: enhancedAnalysis.elements
            .filter((e) => e.element_category === 'functional')
            .map((e) => ({
              name: e.element_name,
              score: e.score,
              evidence: e.evidence?.patterns?.join(', ') || 'No evidence found',
              comparison_insight: getComparisonInsight(
                e.element_name,
                _comparisonData
              ),
            })),
        },
        emotional: {
          score: enhancedAnalysis.emotional_score,
          elements: enhancedAnalysis.elements
            .filter((e) => e.element_category === 'emotional')
            .map((e) => ({
              name: e.element_name,
              score: e.score,
              evidence: e.evidence?.patterns?.join(', ') || 'No evidence found',
              comparison_insight: getComparisonInsight(
                e.element_name,
                _comparisonData
              ),
            })),
        },
        life_changing: {
          score: enhancedAnalysis.life_changing_score,
          elements: enhancedAnalysis.elements
            .filter((e) => e.element_category === 'life_changing')
            .map((e) => ({
              name: e.element_name,
              score: e.score,
              evidence: e.evidence?.patterns?.join(', ') || 'No evidence found',
              comparison_insight: getComparisonInsight(
                e.element_name,
                _comparisonData
              ),
            })),
        },
        social_impact: {
          score: enhancedAnalysis.social_impact_score,
          elements: enhancedAnalysis.elements
            .filter((e) => e.element_category === 'social_impact')
            .map((e) => ({
              name: e.element_name,
              score: e.score,
              evidence: e.evidence?.patterns?.join(', ') || 'No evidence found',
              comparison_insight: getComparisonInsight(
                e.element_name,
                _comparisonData
              ),
            })),
        },
      },
      revenue_opportunities: enhancedAnalysis.revenue_opportunities || [],
      recommendations: enhancedAnalysis.recommendations || [],
      comparison_insights: _comparisonData
        ? generateComparisonInsights(enhancedAnalysis, _comparisonData)
        : null,
    };

    return NextResponse.json({
      success: true,
      url,
      data: frontendData,
      analysisId,
      message: 'Enhanced B2C Elements of Value analysis completed successfully',
    });
  } catch (error) {
    console.error('Enhanced B2C Elements of Value API execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Enhanced B2C Elements of Value analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Enhance analysis with comparison data
 */
function enhanceWithComparisonData(analysis: any, _comparisonData: any): any {
  // Apply comparison-based scoring adjustments
  const enhanced = { ...analysis };

  // Boost scores for elements that perform well in comparison
  if (_comparisonData.competitive_advantages) {
    enhanced.elements = enhanced.elements.map((element: any) => {
      const isCompetitive = _comparisonData.competitive_advantages.some(
        (advantage: string) =>
          advantage.toLowerCase().includes(element.element_name.toLowerCase())
      );

      if (isCompetitive) {
        return {
          ...element,
          score: Math.min(100, element.score + 10), // Boost by 10 points
          evidence: {
            ...element.evidence,
            patterns: [
              ...(element.evidence?.patterns || []),
              'competitive-advantage',
            ],
          },
        };
      }
      return element;
    });
  }

  return enhanced;
}

/**
 * Get comparison insight for specific element
 */
function getComparisonInsight(
  elementName: string,
  _comparisonData: any
): string | null {
  if (!_comparisonData) return null;

  // Look for specific insights about this element
  const insights = _comparisonData.element_insights || [];
  const insight = insights.find((i: any) => i.element === elementName);

  return insight ? insight.insight : null;
}

/**
 * Generate comprehensive comparison insights
 */
function generateComparisonInsights(analysis: any, _comparisonData: any): any {
  return {
    competitive_position:
      analysis.overall_score > 80
        ? 'Strong'
        : analysis.overall_score > 60
          ? 'Moderate'
          : 'Weak',
    improvement_potential: calculateImprovementPotential(analysis),
    market_opportunities: identifyMarketOpportunities(
      analysis,
      _comparisonData
    ),
    strategic_recommendations: generateStrategicRecommendations(
      analysis,
      _comparisonData
    ),
  };
}

function calculateImprovementPotential(analysis: any): string[] {
  const opportunities = [];

  if (analysis.functional_score < 70) {
    opportunities.push(
      'Focus on functional value elements to improve core value proposition'
    );
  }
  if (analysis.emotional_score < 70) {
    opportunities.push(
      'Enhance emotional connection to increase customer loyalty'
    );
  }
  if (analysis.life_changing_score < 70) {
    opportunities.push(
      'Develop life-changing value elements to create deeper customer impact'
    );
  }

  return opportunities;
}

function identifyMarketOpportunities(
  analysis: any,
  _comparisonData: any
): string[] {
  const opportunities = [];

  // Identify gaps in current analysis
  const lowScoringElements = analysis.elements.filter((e: any) => e.score < 50);
  lowScoringElements.forEach((element: any) => {
    opportunities.push(
      `Improve ${element.element_name} to capture market opportunity`
    );
  });

  return opportunities;
}

function generateStrategicRecommendations(
  analysis: any,
  _comparisonData: any
): string[] {
  const recommendations = [];

  // High-level strategic recommendations based on scores
  if (analysis.overall_score < 60) {
    recommendations.push('Implement comprehensive value proposition redesign');
  }
  if (analysis.functional_score > analysis.emotional_score) {
    recommendations.push('Balance functional and emotional value elements');
  }

  return recommendations;
}
