/**
 * Standalone CliftonStrengths Analysis API
 * Follows Content-Comparison pattern: No database dependencies
 */

import { NextRequest, NextResponse } from 'next/server';
import { SimpleFrameworkAnalysisService } from '@/lib/simple-framework-analysis.service';

export const maxDuration = 60; // Set max duration for Vercel serverless function

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { _url, scrapedContent } = body;

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

    const result = await SimpleFrameworkAnalysisService.analyzeCliftonStrengths(url, scrapedContent);

    if (result.success) {
      console.log(`✅ CliftonStrengths analysis completed for: ${url}`);
      return NextResponse.json({
        success: true,
        url: result.url,
        data: result.analysis,
        message: 'CliftonStrengths analysis completed successfully'
      });
    } else {
      console.error(`❌ CliftonStrengths analysis failed for: ${url}`, result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
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
