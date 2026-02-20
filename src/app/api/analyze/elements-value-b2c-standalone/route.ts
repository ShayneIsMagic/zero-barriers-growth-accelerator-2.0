/**
 * B2C Elements of Value Analysis API
 * Accepts existingContent from client (LocalForage) or scrapes as fallback
 * Uses ProductionContentExtractor on Vercel, Puppeteer locally
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const isServerless =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    const {
      url,
      proposedContent,
      analysisType: _analysisType,
      existingContent,
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

    console.log(`🎯 [B2C] Starting B2C Elements analysis for: ${url}`);

    // Step 1: Use provided existing content (from LocalForage/content-comparison) or fetch it
    let existingData;
    if (existingContent) {
      console.log('📦 [B2C] Using provided existing content from client');
      existingData = existingContent;
    } else {
      console.log('🔍 [B2C] No existing content provided - scraping...');

      if (isServerless) {
        // VERCEL: Use ProductionContentExtractor (fetch-based)
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
        // LOCAL: Use /api/analyze/compare as scraping proxy
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXTAUTH_URL ||
          'http://localhost:3000';
        const compareResponse = await fetch(
          `${baseUrl}/api/analyze/compare`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, proposedContent: '' }),
          }
        );

        if (!compareResponse.ok) {
          throw new Error('Failed to get scraped content');
        }

        const compareResult = await compareResponse.json();
        existingData = compareResult.existing;
      }
    }

    console.log(`📦 [B2C] Got scraped content: ${existingData?.wordCount || 0} words`);

    // Step 2: Process proposed content (if provided)
    let proposedData = null;
    if (proposedContent && proposedContent.trim().length > 0) {
      console.log('📝 [B2C] Processing proposed content...');
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

    // Step 3: Run B2C Elements analysis
    console.log('🤖 [B2C] Running B2C Elements analysis...');
    const analysis = await generateB2CAnalysis(
      existingData,
      proposedData,
      url,
      _analysisType || 'full'
    );

    console.log(`✅ [B2C] Analysis complete`);

    return NextResponse.json({
      success: true,
      framework: 'b2c',
      existing: {
        title: existingData.title,
        metaDescription: existingData.metaDescription || existingData.seo?.metaDescription || '',
        wordCount: existingData.wordCount,
        extractedKeywords: existingData.extractedKeywords || existingData.seo?.extractedKeywords || [],
        headings: existingData.headings || existingData.seo?.headings || { h1: [], h2: [], h3: [] },
        cleanText: existingData.cleanText,
        url: existingData.url || url,
      },
      proposed: proposedData,
      analysis: analysis,
      comparison: analysis,
      scrapedContent: existingData,
      message: 'B2C Elements analysis completed successfully',
    });
  } catch (error) {
    console.error('[B2C] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'B2C Elements analysis failed',
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

// B2C Elements Analysis — chunked by category so every element is evaluated
async function generateB2CAnalysis(
  existing: any,
  proposed: any,
  url: string,
  _analysisType: string
) {
  const { analyzeFrameworkInChunks } = await import(
    '@/lib/chunked-framework-analysis'
  );
  const { generateFrameworkFallbackMarkdown } = await import(
    '@/lib/framework-fallback-generator'
  );

  try {
    return await analyzeFrameworkInChunks({
      frameworkName: 'B2C Elements of Value',
      url,
      contentTitle: existing.title || '',
      contentMeta: existing.metaDescription || existing.seo?.metaDescription || '',
      contentKeywords: (existing.extractedKeywords || existing.seo?.extractedKeywords || []).slice(0, 10).join(', '),
      contentText: existing.cleanText || '',
      chunks: [
        {
          categoryName: 'Functional',
          categoryKey: 'functional',
          elements: [
            'saves_time', 'simplifies', 'makes_money', 'reduces_effort',
            'reduces_cost', 'reduces_risk', 'organizes', 'integrates',
            'connects', 'quality', 'variety', 'informs',
            'avoids_hassles', 'sensory_appeal',
          ],
        },
        {
          categoryName: 'Emotional',
          categoryKey: 'emotional',
          elements: [
            'reduces_anxiety', 'rewards_me', 'nostalgia', 'design_aesthetics',
            'badge_value', 'wellness', 'therapeutic', 'fun_entertainment',
            'attractiveness', 'provides_access',
          ],
        },
        {
          categoryName: 'Life-Changing',
          categoryKey: 'life_changing',
          elements: [
            'provides_hope', 'self_actualization', 'motivation',
            'heirloom', 'affiliation_belonging',
          ],
        },
        {
          categoryName: 'Social Impact',
          categoryKey: 'social_impact',
          elements: ['self_transcendence'],
        },
      ],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'AI analysis failed';
    console.log(`📄 [B2C] AI failed, generating Markdown fallback: ${errorMessage}`);
    const fallbackMarkdown = generateFrameworkFallbackMarkdown({
      framework: 'b2c-elements', url, existing, proposed, errorMessage,
    });
    return { _isFallback: true, fallbackMarkdown, error: errorMessage };
  }
}
