/**
 * Brand Archetypes Analysis API (Jambojon Framework)
 * Evaluates all 12 brand archetypes in 4 motivational-group chunks.
 * Accepts existingContent from client (LocalForage) or scrapes as fallback.
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
      stream: useStreaming,
    } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL required' },
        { status: 400 }
      );
    }

    console.log(`🎭 [Archetypes] Starting Brand Archetypes analysis for: ${url}`);

    let existingData;
    if (existingContent) {
      console.log('📦 [Archetypes] Using provided existing content from client');
      existingData = existingContent;
    } else {
      console.log('🔍 [Archetypes] No existing content provided - scraping...');

      if (isServerless) {
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

    console.log(
      `📦 [Archetypes] Got scraped content: ${existingData?.wordCount || 0} words`
    );

    let proposedData = null;
    if (proposedContent && proposedContent.trim().length > 0) {
      console.log('📝 [Archetypes] Processing proposed content...');
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

    console.log('🤖 [Archetypes] Running Brand Archetypes analysis...');

    const buildResponsePayload = (analysis: Record<string, unknown>) => ({
      success: true,
      framework: 'brand-archetypes',
      existing: {
        title: existingData.title,
        metaDescription:
          existingData.metaDescription ||
          existingData.seo?.metaDescription ||
          '',
        wordCount: existingData.wordCount,
        extractedKeywords:
          existingData.extractedKeywords ||
          existingData.seo?.extractedKeywords ||
          [],
        headings:
          existingData.headings ||
          existingData.seo?.headings ||
          { h1: [], h2: [], h3: [] },
        cleanText: existingData.cleanText,
        url: existingData.url || url,
      },
      proposed: proposedData,
      analysis,
      comparison: analysis,
      scrapedContent: existingData,
      message: 'Brand Archetypes analysis completed successfully',
    });

    if (useStreaming) {
      const { streamChunkedAnalysis } = await import('@/lib/streaming-analysis');
      return streamChunkedAnalysis({
        analysisOptions: buildArchetypeOptions(existingData, url),
        buildResponse: buildResponsePayload,
        frameworkLabel: 'Brand Archetypes',
      });
    }

    const analysis = await generateArchetypesAnalysis(existingData, proposedData, url, _analysisType || 'full');
    console.log('✅ [Archetypes] Analysis complete');
    return NextResponse.json(buildResponsePayload(analysis as Record<string, unknown>));
  } catch (error) {
    console.error('[Archetypes] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Brand Archetypes analysis failed',
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

function buildArchetypeOptions(existing: any, url: string) {
  return {
    frameworkName: 'Jambojon Brand Archetypes',
    url,
    contentTitle: existing.title || '',
    contentMeta: existing.metaDescription || existing.seo?.metaDescription || '',
    contentKeywords: (existing.extractedKeywords || existing.seo?.extractedKeywords || []).slice(0, 10).join(', '),
    contentText: existing.cleanText || '',
    scoringInstructions: `Score each archetype 0.0-1.0 based on three weighted factors:
  1. Keyword Presence (40%): exact keyword matches from the archetype's KEYWORD SIGNALS list, plus synonyms and thematic matches
  2. Thematic Alignment (30%): how well content matches the archetype definition and core characteristics
  3. Value Delivery (30%): match with the archetype's "as the guide" assistance patterns and tone consistency

Rubric:
- 0.8-1.0 (Dominant): Strong keyword clusters + perfect thematic match + clear value delivery
- 0.6-0.79 (Strong): Multiple keywords + thematic patterns present + value signals evident
- 0.4-0.59 (Moderate): Some keywords + moderate thematic match + weak value signals
- 0.0-0.39 (Weak/Absent): Minimal or no meaningful presence`,
    chunks: [
      {
        categoryName: 'Ego Archetypes (Leave a Mark on the World)',
        categoryKey: 'ego',
        elements: ['hero', 'magician', 'outlaw'],
      },
      {
        categoryName: 'Order Archetypes (Provide Structure)',
        categoryKey: 'order',
        elements: ['caregiver', 'ruler', 'creator'],
      },
      {
        categoryName: 'Freedom Archetypes (Yearn for Paradise)',
        categoryKey: 'freedom',
        elements: ['innocent', 'explorer', 'sage'],
      },
      {
        categoryName: 'Social Archetypes (Connect with Others)',
        categoryKey: 'social',
        elements: ['regular_guy_girl', 'jester', 'lover'],
      },
    ],
  };
}

async function generateArchetypesAnalysis(existing: any, proposed: any, url: string, _analysisType: string) {
  const { analyzeFrameworkInChunks } = await import('@/lib/chunked-framework-analysis');
  const { generateFrameworkFallbackMarkdown } = await import('@/lib/framework-fallback-generator');

  try {
    return await analyzeFrameworkInChunks(buildArchetypeOptions(existing, url));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'AI analysis failed';
    console.log(`📄 [Archetypes] AI failed, generating Markdown fallback: ${errorMessage}`);
    const fallbackMarkdown = generateFrameworkFallbackMarkdown({
      framework: 'brand-archetypes', url, existing, proposed, errorMessage,
    });
    return { _isFallback: true, fallbackMarkdown, error: errorMessage };
  }
}
