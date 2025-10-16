/**
 * B2B Elements of Value Analysis API
 * Focuses on enterprise value elements and revenue opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { RevenueFocusedElementsOfValueService } from '@/lib/services/revenue-focused-elements-value.service';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scrapedContent } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    if (!scrapedContent) {
      return NextResponse.json({
        success: false,
        error: 'Scraped content is required'
      }, { status: 400 });
    }

    console.log(`💰 Starting B2B Elements of Value analysis for: ${url}`);

    // Use the provided scraped content instead of scraping again
    const result = await RevenueFocusedElementsOfValueService.analyzeWithScrapedContent(url, scrapedContent);

    if (!result.success) {
      console.error('B2B Elements of Value analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'B2B Elements of Value analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ B2B Elements of Value analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.data.b2b, // Return only B2B data
      message: 'B2B Elements of Value analysis completed successfully'
    });

  } catch (error) {
    console.error('B2B Elements of Value API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'B2B Elements of Value analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
