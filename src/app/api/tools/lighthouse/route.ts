/**
 * Google Lighthouse API
 * Uses PageSpeed Insights API (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    console.log(`🔍 Running Lighthouse via PageSpeed Insights API for: ${url}`);

    // Google PageSpeed Insights API (free, no key needed for basic use)
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'PageSpeed API failed');
    }

    // Extract scores
    const lighthouse = data.lighthouseResult;
    const scores = {
      performance: Math.round(
        (lighthouse.categories.performance?.score || 0) * 100
      ),
      accessibility: Math.round(
        (lighthouse.categories.accessibility?.score || 0) * 100
      ),
      bestPractices: Math.round(
        (lighthouse.categories['best-practices']?.score || 0) * 100
      ),
      seo: Math.round((lighthouse.categories.seo?.score || 0) * 100),
    };

    // Extract key metrics
    const metrics = {
      'First Contentful Paint':
        lighthouse.audits['first-contentful-paint']?.displayValue,
      'Largest Contentful Paint':
        lighthouse.audits['largest-contentful-paint']?.displayValue,
      'Total Blocking Time':
        lighthouse.audits['total-blocking-time']?.displayValue,
      'Cumulative Layout Shift':
        lighthouse.audits['cumulative-layout-shift']?.displayValue,
      'Speed Index': lighthouse.audits['speed-index']?.displayValue,
    };

    console.log(
      `✅ Lighthouse complete - Performance: ${scores.performance}/100`
    );

    return NextResponse.json({
      success: true,
      scores,
      metrics,
      fullReport: lighthouse,
    });
  } catch (error) {
    console.error('Lighthouse API error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to run Lighthouse',
      },
      { status: 500 }
    );
  }
}
