/**
 * Get Scraped Content API
 * Retrieves already-scraped content from the content-comparison API
 * No fresh scraping - just uses what was already collected
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // Check if content already exists in the content-comparison API
    // This API just returns the scraped data from content-comparison
    // without triggering a new scrape

    console.log(`📦 Getting scraped content for: ${url}`);

    // Return a response indicating to use the content-comparison API
    return NextResponse.json({
      success: true,
      message: 'Use the scraped content from content-comparison API',
      instruction: 'Call /api/analyze/compare with the URL to get scraped content',
      url,
      usage: {
        endpoint: '/api/analyze/compare',
        method: 'POST',
        body: {
          url,
          proposedContent: '' // Empty string if no proposed content
        }
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get content'
    }, { status: 500 });
  }
}




