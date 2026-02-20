/**
 * B2B Elements of Value Analysis API
 * Accepts existingContent from client (LocalForage) or scrapes as fallback
 * Uses ProductionContentExtractor on Vercel, compare API locally
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

    console.log(`🔄 Starting B2B Elements analysis for: ${url}`);

    // Step 1: Use provided existing content (from LocalForage/content-comparison) or fetch it
    let existingData;
    if (existingContent) {
      console.log('📦 Using provided existing content from client');
      existingData = existingContent;
    } else if (isServerless) {
      console.log('🌐 No existing content - using ProductionContentExtractor on Vercel...');
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
      console.log('🔍 No existing content - calling compare API locally...');
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

    // Step 3: Run B2B Elements analysis
    console.log('🤖 Step 3: Running B2B Elements analysis...');
    const analysis = await generateB2BAnalysis(
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
      comparison: analysis,
      message: 'B2B Elements analysis completed',
    });
  } catch (error) {
    console.error('B2B Elements analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'B2B Elements analysis failed',
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

// B2B Elements Analysis — chunked by category so every element is evaluated
async function generateB2BAnalysis(
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
      frameworkName: 'B2B Elements of Value',
      url,
      contentTitle: existing.title || '',
      contentMeta: existing.metaDescription || existing.seo?.metaDescription || '',
      contentKeywords: (existing.extractedKeywords || existing.seo?.extractedKeywords || []).slice(0, 10).join(', '),
      contentText: existing.cleanText || '',
      chunks: [
        {
          categoryName: 'Table Stakes',
          categoryKey: 'table_stakes',
          elements: [
            'meeting_specifications', 'acceptable_price',
            'regulatory_compliance', 'ethical_standards',
          ],
        },
        {
          categoryName: 'Functional Value',
          categoryKey: 'functional',
          elements: [
            'improved_top_line', 'cost_reduction', 'product_quality',
            'scalability', 'innovation', 'risk_reduction', 'reach',
            'flexibility', 'component_quality',
          ],
        },
        {
          categoryName: 'Ease of Doing Business',
          categoryKey: 'ease_of_business',
          elements: [
            'time_savings', 'reduced_effort', 'decreased_hassles',
            'information', 'transparency', 'organization', 'simplification',
            'connection', 'integration', 'access', 'availability',
            'variety', 'configurability', 'responsiveness', 'expertise',
            'commitment', 'stability', 'cultural_fit',
          ],
        },
        {
          categoryName: 'Individual Value',
          categoryKey: 'individual',
          elements: [
            'network_expansion', 'marketability', 'reputational_assurance',
            'design_aesthetics_b2b', 'growth_development',
            'reduced_anxiety_b2b', 'fun_perks',
          ],
        },
        {
          categoryName: 'Inspirational Value',
          categoryKey: 'inspirational',
          elements: ['purpose', 'vision', 'hope_b2b', 'social_responsibility'],
        },
      ],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'AI analysis failed';
    console.log(`📄 [B2B] AI failed, generating Markdown fallback: ${errorMessage}`);
    const fallbackMarkdown = generateFrameworkFallbackMarkdown({
      framework: 'b2b-elements', url, existing, proposed, errorMessage,
    });
    return { _isFallback: true, fallbackMarkdown, error: errorMessage };
  }
}
