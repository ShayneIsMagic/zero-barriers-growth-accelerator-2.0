/**
 * Universal Content Scraping API
 * Uses the universal Puppeteer scraper for all assessment types
 */

import { UniversalPuppeteerScraper } from '@/lib/universal-puppeteer-scraper';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🔍 Starting universal scraping for: ${url}`);

    // Use the universal scraper
    const scrapedData = await UniversalPuppeteerScraper.scrapeWebsite(url);

    return NextResponse.json({
      success: true,
      data: scrapedData,
      message: 'Content scraped successfully'
    });

  } catch (error) {
    console.error('Universal scraping error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Scraping failed'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const healthCheck = await UniversalPuppeteerScraper.healthCheck();

    return NextResponse.json({
      success: true,
      status: healthCheck.status,
      message: healthCheck.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 500 });
  }
}
