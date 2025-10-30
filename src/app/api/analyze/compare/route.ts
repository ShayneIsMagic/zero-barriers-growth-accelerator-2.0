/**
 * Content Comparison API
 * Compare existing website content vs. proposed new content
 * Side-by-side analysis showing improvements
 */

import { UniversalPuppeteerScraper } from '@/lib/universal-puppeteer-scraper';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const {
      url,
      proposedContent,
      analysisType: _analysisType,
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

    console.log(`🔄 Starting comparison analysis for: ${url}`);

    // Step 1: Scrape real website data using universal scraper
    console.log('📊 Step 1: Scraping website content...');
    const existingData = await UniversalPuppeteerScraper.scrapeWebsite(url);

    // Step 2: Process proposed content (if provided)
    let proposedData = null;
    if (proposedContent && proposedContent.trim().length > 0) {
      console.log('📝 Step 2: Processing proposed content...');
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

    // Step 3: Run AI comparison analysis
    console.log('🤖 Step 3: Running AI comparison analysis...');
    const comparisonReport = await generateComparisonReport(
      existingData,
      proposedData,
      url,
      _analysisType || 'full'
    );

    return NextResponse.json({
      success: true,
      existing: {
        title: existingData.title,
        metaDescription: existingData.seo.metaDescription,
        wordCount: existingData.wordCount,
        extractedKeywords: existingData.seo.extractedKeywords,
        headings: existingData.seo.headings,
        cleanText: existingData.cleanText,
        url: existingData.url,
      },
      proposed: proposedData,
      comparison: comparisonReport,
      message: 'Comparison analysis completed',
    });
  } catch (error) {
    console.error('Comparison analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Comparison failed',
      },
      { status: 500 }
    );
  }
}

// Helper functions
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

  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

function extractHeadings(content: string): {
  h1: string[];
  h2: string[];
  h3: string[];
} {
  const lines = content.split('\n');
  return {
    h1: lines
      .filter((l) => l.startsWith('# '))
      .map((l) => l.replace('# ', '').trim()),
    h2: lines
      .filter((l) => l.startsWith('## '))
      .map((l) => l.replace('## ', '').trim()),
    h3: lines
      .filter((l) => l.startsWith('### '))
      .map((l) => l.replace('### ', '').trim()),
  };
}

interface _AnalysisData {
  content?: string;
  headings?: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  [key: string]: unknown;
}

// Using imported ScrapedData interface from reliable-content-scraper

async function generateComparisonReport(
  existing: any,
  proposed: any,
  url: string,
  _analysisType: string
) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');

  const prompt = `Competitor Discovery and Competitiveness Assessment (no frameworks):

Goal: From the scraped content, identify likely competitors and assess how competitive the current page language is. If proposed content is provided, assess how competitive the proposed language would be versus the current live page.

URL: ${url}

EXISTING CONTENT SNAPSHOT:
- Word Count: ${existing.wordCount}
- Title: ${existing.title}
- Meta Description: ${existing.metaDescription}
- Top Keywords: ${existing.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- Excerpt: ${existing.cleanText.substring(0, 2000)}

${
  proposed
    ? `PROPOSED CONTENT SNAPSHOT:
- Word Count: ${proposed.wordCount}
- Title: ${proposed.title}
- Meta Description: ${proposed.metaDescription}
- Top Keywords: ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- Excerpt: ${proposed.cleanText.substring(0, 2000)}
`
    : 'No proposed content provided — evaluate existing only.'
}

Tasks:
1) Competitors: Infer 5–10 likely direct competitors based on the product/service domain, positioning, and keywords implied by the content. For each, include a short rationale (why they are competitive) and the primary angle they compete on (e.g., feature set, pricing, segment, performance, UX, brand).
2) Competitive Positioning (Current): Evaluate how the current page’s language positions against those competitors. Consider clarity, differentiation, specificity, outcome orientation, and keyword competitiveness.
3) Competitive Positioning (Proposed): ${proposed ? 'Evaluate the proposed content against the same competitors.' : 'Skip if no proposed content is provided.'}
4) Recommendations: Concrete suggestions to improve competitive differentiation and language strength (avoid frameworks — focus on messaging, specificity, and competitor angles).

Output strict JSON with this shape:
{
  "competitors": [
    { "name": "string", "rationale": "string", "primary_competitive_angle": "string" }
  ],
  "current": {
    "language_competitiveness_score": 0-100,
    "positioning_summary": "string",
    "strengths": ["string"],
    "gaps": ["string"]
  },
  "proposed": ${proposed ? `{
    "language_competitiveness_score": 0-100,
    "positioning_summary": "string",
    "strengths": ["string"],
    "gaps": ["string"]
  }` : 'null'},
  "recommendations": ["string"],
  "notes": "short, non-marketing commentary"
}`;

  try {
    const result = await analyzeWithGemini(prompt, 'comparison');
    return result;
  } catch (error) {
    return {
      error: 'AI comparison failed',
      fallbackPrompt: prompt,
    };
  }
}
