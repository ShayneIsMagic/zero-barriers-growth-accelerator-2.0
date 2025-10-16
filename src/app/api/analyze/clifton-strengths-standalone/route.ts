/**
 * Standalone CliftonStrengths Analysis API
 * Follows Content-Comparison pattern: No database dependencies
 */

import { SimpleCliftonStrengthsService } from '@/lib/services/simple-clifton-strengths.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set max duration for Vercel serverless function

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

    console.log(`🎯 Starting CliftonStrengths analysis for: ${url}`);

    const result = await SimpleCliftonStrengthsService.analyzeWithScrapedContent(url, scrapedContent);

    if (result.success) {
      console.log(`✅ CliftonStrengths analysis completed for: ${url}`);
      return NextResponse.json(result);
    } else {
      console.error(`❌ CliftonStrengths analysis failed for: ${url}`, result.error);
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('CliftonStrengths analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
      details: 'CliftonStrengths analysis encountered an error'
    }, { status: 500 });
  }
}
