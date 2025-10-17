import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, industry: _industry } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting simple Phase 1 data collection for: ${url}`);

    // Use the WORKING scraper from content comparison page
    console.log('🔍 Step 1: Scraping website content...');
    const scrapedContent = await scrapeWebsiteContent(url);

    console.log(`✅ Successfully scraped ${scrapedContent.wordCount} words from ${url}`);

    // Return scraped content without storing in complex tables
    return NextResponse.json({
      success: true,
      url,
      data: scrapedContent,
      message: 'Simple Phase 1 data collection completed.'
    });

  } catch (error) {
    console.error('Simple Phase 1 execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Simple Phase 1 data collection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}