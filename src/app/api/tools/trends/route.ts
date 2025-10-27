/**
 * Google Trends - Basic keyword analysis
 * Uses google-trends-api package (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json();

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Keywords array required' },
        { status: 400 }
      );
    }

    console.log(`📈 Analyzing trends for keywords: ${keywords.join(', ')}`);

    // Use google-trends-api npm package
    const googleTrends = require('google-trends-api');

    const trendsData = [];

    for (const keyword of keywords.slice(0, 5)) {
      // Limit to 5 keywords
      try {
        // Interest over time
        const interestOverTime = await googleTrends.interestOverTime({
          keyword: keyword,
          startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
          geo: 'US',
        });

        const parsed = JSON.parse(interestOverTime);
        const timelineData = parsed.default?.timelineData || [];

        // Calculate trend
        const values = timelineData.map((d: any) => d.value[0]);
        const avgValue =
          values.reduce((a: number, b: number) => a + b, 0) / values.length;
        const recentValue = values[values.length - 1];
        const trend =
          recentValue > avgValue
            ? 'up'
            : recentValue < avgValue
              ? 'down'
              : 'stable';

        trendsData.push({
          keyword,
          trend,
          averageInterest: Math.round(avgValue),
          currentInterest: recentValue,
          data: timelineData,
        });
      } catch (err) {
        console.warn(`Failed to get trends for ${keyword}:`, err);
        trendsData.push({
          keyword,
          trend: 'unknown',
          error: 'Failed to fetch data',
        });
      }
    }

    console.log(
      `✅ Trends analysis complete for ${trendsData.length} keywords`
    );

    return NextResponse.json({
      success: true,
      trends: trendsData,
    });
  } catch (error) {
    console.error('Google Trends error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to analyze trends',
      },
      { status: 500 }
    );
  }
}
