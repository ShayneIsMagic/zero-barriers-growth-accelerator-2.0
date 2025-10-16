/**
 * Content Scraping API
 * Uses Puppeteer to scrape website content for analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🕷️ Starting content scraping for: ${url}`);

    const scrapedData = await scrapeWebsiteContent(url);

    if (!scrapedData) {
      console.error('Content scraping failed for:', url);
      return NextResponse.json({
        success: false,
        error: 'Content scraping failed',
        details: 'Unable to extract content from the website'
      }, { status: 500 });
    }

    console.log(`✅ Content scraping completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url,
      data: scrapedData,
      message: 'Content successfully scraped'
    });

  } catch (error) {
    console.error('Content scraping API execution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Content scraping failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
