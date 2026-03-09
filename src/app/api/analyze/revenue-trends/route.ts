/**
 * Revenue Trends Analysis API
 * Follows the same content-comparison + chunked framework pattern as other assessments.
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

const isServerless =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    const {
      url,
      proposedContent,
      analysisType: _analysisType,
      existingContent,
      stream: useStreaming,
    } = await request.json();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL required',
        },
        { status: 400 }
      );
    }

    let existingData;
    if (existingContent) {
      existingData = existingContent;
    } else if (isServerless) {
      const { ProductionContentExtractor } = await import(
        '@/lib/production-content-extractor'
      );
      const extractor = new ProductionContentExtractor();
      const extractedData = await extractor.extractContent(url);
      existingData = {
        title: extractedData.title || 'Untitled',
        metaDescription: extractedData.metaDescription || '',
        wordCount: extractedData.wordCount || 0,
        cleanText: extractedData.content || '',
        extractedKeywords: [],
        headings: { h1: [], h2: [], h3: [] },
        url,
        seo: {
          metaTitle: extractedData.title || '',
          metaDescription: extractedData.metaDescription || '',
          extractedKeywords: [],
          headings: { h1: [], h2: [], h3: [] },
        },
      };
    } else {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        'http://localhost:3000';
      const compareResponse = await fetch(`${baseUrl}/api/analyze/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, proposedContent: '' }),
      });
      if (!compareResponse.ok) {
        throw new Error('Failed to get scraped content');
      }
      const compareResult = await compareResponse.json();
      existingData = compareResult.existing;
    }

    let proposedData = null;
    if (proposedContent && proposedContent.trim().length > 0) {
      proposedData = {
        cleanText: proposedContent.trim(),
        wordCount: proposedContent.trim().split(/\s+/).length,
        title: extractTitle(proposedContent),
        metaDescription: extractMetaDescription(proposedContent),
        extractedKeywords: extractKeywordsFromText(proposedContent),
        headings: extractHeadings(proposedContent),
        seo: {
          metaTitle: extractTitle(proposedContent),
          metaDescription: extractMetaDescription(proposedContent),
          extractedKeywords: extractKeywordsFromText(proposedContent),
          headings: extractHeadings(proposedContent),
        },
      };
    }

    const buildResponsePayload = (analysis: Record<string, unknown>) => ({
      success: true,
      framework: 'revenue-trends',
      existing: {
        title: existingData.title,
        metaDescription:
          existingData.metaDescription || existingData.seo?.metaDescription || '',
        wordCount: existingData.wordCount,
        extractedKeywords:
          existingData.extractedKeywords ||
          existingData.seo?.extractedKeywords ||
          [],
        headings:
          existingData.headings ||
          existingData.seo?.headings || { h1: [], h2: [], h3: [] },
        cleanText: existingData.cleanText,
        url: existingData.url || url,
      },
      proposed: proposedData,
      analysis,
      comparison: analysis,
      scrapedContent: existingData,
      message: 'Revenue Trends analysis completed successfully',
    });

    const analysisOptions = buildRevenueOptions(existingData, url);
    if (useStreaming) {
      const { streamChunkedAnalysis } = await import('@/lib/streaming-analysis');
      return streamChunkedAnalysis({
        analysisOptions,
        buildResponse: buildResponsePayload,
        frameworkLabel: 'Revenue Trends',
      });
    }

    const analysis = await generateRevenueAnalysis(existingData, proposedData, url);
    return NextResponse.json(buildResponsePayload(analysis));
  } catch (error) {
    console.error('Revenue trends analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Revenue trends analysis failed',
      },
      { status: 500 }
    );
  }
}

function extractTitle(content: string): string {
  const lines = content.split('\n');
  return lines[0]?.trim().substring(0, 60) || 'Proposed Title';
}

function extractMetaDescription(content: string): string {
  const lines = content.split('\n');
  return (
    lines.slice(0, 3).join(' ').trim().substring(0, 160) ||
    'Proposed description'
  );
}

function extractKeywordsFromText(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  const wordCount: { [key: string]: number } = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function extractHeadings(content: string): string[] {
  const lines = content.split('\n');
  return lines
    .filter(
      (line) =>
        line.trim().startsWith('#') || line.trim().match(/^[A-Z][^.!?]*$/)
    )
    .map((line) => line.trim().replace(/^#+\s*/, ''))
    .slice(0, 10);
}

function buildRevenueOptions(existing: any, url: string) {
  return {
    frameworkName: 'Revenue Trends',
    url,
    contentTitle: existing.title || '',
    contentMeta: existing.metaDescription || existing.seo?.metaDescription || '',
    contentKeywords: (existing.extractedKeywords || existing.seo?.extractedKeywords || [])
      .slice(0, 10)
      .join(', '),
    contentText: existing.cleanText || '',
    scoringInstructions: `Score each element 0.0-1.0 (flat fractional scoring):
- 0.8-1.0: Excellent — strong market/revenue evidence
- 0.6-0.79: Good — present but can be strengthened
- 0.4-0.59: Needs Work — weak signals
- 0.0-0.39: Poor — absent or unclear`,
    chunks: [
      {
        categoryName: 'Market Analysis',
        categoryKey: 'market_analysis',
        elements: [
          'market_demand',
          'trending_keywords',
          'seasonal_patterns',
          'competitor_gaps',
        ],
      },
      {
        categoryName: 'Opportunity Identification',
        categoryKey: 'opportunity_identification',
        elements: [
          'emerging_opportunities',
          'price_sensitivity',
          'customer_segments',
          'conversion_potential',
        ],
      },
      {
        categoryName: 'Revenue Optimization',
        categoryKey: 'revenue_optimization',
        elements: [
          'upsell_opportunities',
          'cross_sell_potential',
          'retention_strategies',
          'expansion_opportunities',
        ],
      },
      {
        categoryName: 'Growth Strategies',
        categoryKey: 'growth_strategies',
        elements: [
          'partnership_potential',
          'content_gaps',
          'seo_opportunities',
          'social_media_trends',
        ],
      },
    ],
  };
}

async function generateRevenueAnalysis(
  existing: any,
  proposed: any,
  url: string
): Promise<Record<string, unknown>> {
  const { analyzeFrameworkInChunks } = await import(
    '@/lib/chunked-framework-analysis'
  );
  const { generateFrameworkFallbackMarkdown } = await import(
    '@/lib/framework-fallback-generator'
  );

  try {
    return await analyzeFrameworkInChunks(buildRevenueOptions(existing, url));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'AI analysis failed';
    const fallbackMarkdown = generateFrameworkFallbackMarkdown({
      framework: 'revenue-trends',
      url,
      existing,
      proposed,
      errorMessage,
    });
    return { _isFallback: true, fallbackMarkdown, error: errorMessage };
  }
}
