/**
 * API endpoint for testing prompts between Gemini and Claude
 */

import { PromptTestingService } from '@/lib/ai-engines/prompt-testing.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for comprehensive testing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { _url, scrapedData, assessmentType } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    if (!scrapedData) {
      return NextResponse.json({
        success: false,
        error: 'Scraped data is required'
      }, { status: 400 });
    }

    console.log(`🧪 Starting prompt testing for: ${url}`);

    let results;

    if (assessmentType) {
      // Test specific assessment type
      console.log(`Testing ${assessmentType} assessment...`);
      results = await PromptTestingService.testPrompt(assessmentType, scrapedData, url);
    } else {
      // Test all assessment types
      console.log('Running comprehensive prompt testing...');
      results = await PromptTestingService.runComprehensiveTest(scrapedData, url);
    }

    console.log(`✅ Prompt testing completed for: ${url}`);

    return NextResponse.json({
      success: true,
      _url,
      assessmentType: assessmentType || 'all',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prompt testing failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Prompt testing failed',
      details: 'Failed to test prompts between Gemini and Claude'
    }, { status: 500 });
  }
}
