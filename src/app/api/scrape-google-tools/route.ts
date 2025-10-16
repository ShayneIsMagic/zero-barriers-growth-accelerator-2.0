/**
 * API endpoint to scrape Google Tools data using Puppeteer
 */

import { PuppeteerGoogleToolsService } from '@/lib/services/puppeteer-google-tools.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for Vercel serverless function

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, keywords = [] } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🤖 Starting Puppeteer Google Tools scraping for: ${url}`);
    console.log(`🔍 Keywords: ${keywords.join(', ')}`);

    // Scrape all Google Tools data
    const scrapedData = await PuppeteerGoogleToolsService.scrapeAllGoogleToolsData(url, keywords);

    console.log(`✅ Puppeteer Google Tools scraping completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url,
      keywords,
      data: scrapedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Puppeteer Google Tools scraping failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Google Tools scraping failed',
      details: 'This might be due to authentication requirements or rate limiting'
    }, { status: 500 });
  } finally {
    // Clean up browser instance
    try {
      await PuppeteerGoogleToolsService.closeBrowser();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}
