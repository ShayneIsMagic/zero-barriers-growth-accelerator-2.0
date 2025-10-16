/**
 * API endpoint to scrape Google Tools data using Puppeteer
 */

import { PuppeteerGoogleToolsService } from '@/lib/services/puppeteer-google-tools.service';
import { MockGoogleToolsService } from '@/lib/services/mock-google-tools.service';
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

    console.log(`🤖 Starting Google Tools data extraction for: ${url}`);
    console.log(`🔍 Keywords: ${keywords.join(', ')}`);

    let scrapedData;
    let dataSource = 'unknown';

    try {
      // Try Puppeteer first (works in local development)
      console.log('🕷️ Attempting Puppeteer scraping...');
      scrapedData = await PuppeteerGoogleToolsService.scrapeAllGoogleToolsData(url, keywords);
      dataSource = 'puppeteer';
      console.log('✅ Puppeteer scraping successful');
    } catch (puppeteerError) {
      console.log('⚠️ Puppeteer failed, falling back to mock data...');
      console.log('Puppeteer error:', puppeteerError);
      
      // Fallback to mock data (works in Vercel serverless)
      scrapedData = MockGoogleToolsService.generateAllGoogleToolsData(url, keywords);
      dataSource = 'mock';
      console.log('✅ Mock data generation successful');
    }

    console.log(`✅ Google Tools data extraction completed for: ${url}`);
    console.log(`📊 Data source: ${dataSource}`);

    return NextResponse.json({
      success: true,
      url,
      keywords,
      data: scrapedData,
      dataSource,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Google Tools data extraction failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Google Tools data extraction failed',
      details: 'Both Puppeteer and mock data generation failed'
    }, { status: 500 });
  } finally {
    // Clean up browser instance if it was used
    try {
      await PuppeteerGoogleToolsService.closeBrowser();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}
