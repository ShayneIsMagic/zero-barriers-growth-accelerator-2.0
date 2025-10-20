/**
 * B2C Elements of Value Analysis API
 * Uses unified AI analysis service with structured storage
 */

import { AnalysisFramework, UnifiedAIAnalysisService } from '@/lib/shared/unified-ai-analysis.service';
// import { StructuredStorageService } from '@/lib/services/structured-storage.service';
// import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for AI analysis


// B2C Elements of Value framework definition
const B2C_FRAMEWORK: AnalysisFramework = {
  name: 'B2C Elements of Value',
  description: 'Analyze consumer value elements across functional, emotional, life-changing, and social impact categories',
  elements: [
    // Functional (8 elements)
    'saves_time', 'simplifies', 'reduces_cost', 'reduces_risk',
    'organizes', 'integrates', 'connects', 'fun_entertainment',
    // Emotional (9 elements)
    'reduces_anxiety', 'rewards_me', 'nostalgia', 'design_aesthetics',
    'wellness', 'therapeutic_value', 'attractiveness', 'provides_access', 'variety',
    // Life Changing (8 elements)
    'self_actualization', 'motivation', 'heirloom', 'affiliation_belonging',
    'provides_hopes', 'self_expression', 'provides_memories', 'badge_me',
    // Social Impact (5 elements)
    'belonging', 'environmental_consciousness', 'social_impact', 'community', 'purpose'
  ],
  categories: {
    functional: ['saves_time', 'simplifies', 'reduces_cost', 'reduces_risk', 'organizes', 'integrates', 'connects', 'fun_entertainment'],
    emotional: ['reduces_anxiety', 'rewards_me', 'nostalgia', 'design_aesthetics', 'wellness', 'therapeutic_value', 'attractiveness', 'provides_access', 'variety'],
    life_changing: ['self_actualization', 'motivation', 'heirloom', 'affiliation_belonging', 'provides_hopes', 'self_expression', 'provides_memories', 'badge_me'],
    social_impact: ['belonging', 'environmental_consciousness', 'social_impact', 'community', 'purpose']
  },
  analysisType: 'b2c-elements'
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
      B2C_FRAMEWORK,
      url,
      proposedContent
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        ...result.data,
        message: 'B2C Elements of Value analysis completed successfully using unified AI analysis service'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'B2C Elements of Value analysis failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('B2C Elements of Value API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'B2C Elements of Value analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
