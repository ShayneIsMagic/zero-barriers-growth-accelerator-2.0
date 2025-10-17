/**
 * B2C Elements of Value Analysis API
 * Focuses on consumer value elements and revenue opportunities
 */

import { SimpleFrameworkAnalysisService } from '@/lib/simple-framework-analysis.service';
import { NextRequest, NextResponse } from 'next/server';

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

    // Normalize scraped content format
    let normalizedContent;
    if (typeof scrapedContent === 'string') {
      normalizedContent = {
        title: url.split('/')[2] || 'Website',
        cleanText: scrapedContent
      };
    } else {
      normalizedContent = scrapedContent;
    }

    console.log(`💰 Starting B2C Elements of Value analysis for: ${url}`);

    // Use simple framework analysis
    const result = await SimpleFrameworkAnalysisService.analyzeB2CElements(url, normalizedContent);

    if (!result.success) {
      console.error('B2C Elements of Value analysis failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'B2C Elements of Value analysis failed',
        details: result.error
      }, { status: 500 });
    }

    console.log(`✅ B2C Elements of Value analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url: result.url,
      data: result.analysis,
      message: 'B2C Elements of Value analysis completed successfully'
    });

  } catch (error) {
    console.error('B2C Elements of Value API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'B2C Elements of Value analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
