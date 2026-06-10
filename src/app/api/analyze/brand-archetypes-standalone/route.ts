/**
 * Brand Archetypes Analysis API (Jambojon Framework)
 * Evaluates all 12 brand archetypes in 4 motivational-group chunks.
 * Accepts existingContent from client (LocalForage) or scrapes as fallback.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  buildPuppeteerEvidencePackage,
  type PuppeteerEvidencePackage,
} from '@/lib/framework-evidence-protocol';
import { buildChunkAnalysisOptions } from '@/lib/framework/build-chunk-options';
import { enrichAnalysisWithArchetypeRanking } from '@/lib/framework/archetype-ranking';
import { buildAnalysisTraceability } from '@/lib/server/analysis-traceability';
import {
  buildPersistenceOnComplete,
  enrichResponseWithPersistence,
} from '@/lib/server/analysis-persistence';

export const maxDuration = 300;

const isServerless =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

interface ExistingContentShape {
  title?: string;
  metaDescription?: string;
  wordCount?: number;
  cleanText?: string;
  extractedKeywords?: string[];
  headings?: { h1: string[]; h2: string[]; h3: string[] };
  url?: string;
  seo?: {
    metaDescription?: string;
    extractedKeywords?: string[];
    headings?: { h1: string[]; h2: string[]; h3: string[] };
  };
}

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

    let existingData: ExistingContentShape;
    if (existingContent) {
      existingData = existingContent as ExistingContentShape;
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
          metaDescription: extractedData.metaDescription || '',
          extractedKeywords: [],
          headings: { h1: [], h2: [], h3: [] },
        },
      };
    } else {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        request.nextUrl.origin;
      const compareResponse = await fetch(`${baseUrl}/api/analyze/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, proposedContent: '' }),
      });

      if (!compareResponse.ok) {
        throw new Error('Failed to get scraped content');
      }

      const compareResult = await compareResponse.json();
      existingData = compareResult.existing as ExistingContentShape;
    }

    const evidencePackage = buildPuppeteerEvidencePackage(
      existingData as Parameters<typeof buildPuppeteerEvidencePackage>[0]
    );

    let proposedData: ExistingContentShape | null = null;
    if (proposedContent && proposedContent.trim().length > 0) {
      proposedData = {
        cleanText: proposedContent.trim(),
        wordCount: proposedContent.trim().split(/\s+/).length,
        title: extractTitle(proposedContent),
        metaDescription: extractMetaDescription(proposedContent),
        extractedKeywords: extractKeywordsFromText(proposedContent),
        headings: { h1: extractHeadings(proposedContent), h2: [], h3: [] } as {
          h1: string[];
          h2: string[];
          h3: string[];
        },
        seo: {
          metaDescription: extractMetaDescription(proposedContent),
          extractedKeywords: extractKeywordsFromText(proposedContent),
          headings: { h1: extractHeadings(proposedContent), h2: [], h3: [] },
        },
      };
    }

    const buildResponsePayload = (analysis: Record<string, unknown>) => {
      const enrichedAnalysis = enrichAnalysisWithArchetypeRanking(analysis);
      const readableMarkdown =
        typeof enrichedAnalysis.unifiedReport === 'string'
          ? enrichedAnalysis.unifiedReport
          : null;

      return {
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
        analysis: enrichedAnalysis,
        comparison: enrichedAnalysis,
        readableMarkdown,
        traceability: buildAnalysisTraceability({
          url,
          existing: existingData,
          proposed: proposedData,
          analysis: enrichedAnalysis,
          usedProvidedExistingContent: Boolean(existingContent),
        }),
        scrapedContent: existingData,
        puppeteerEvidence: evidencePackage,
        message: 'Brand Archetypes analysis completed successfully',
      };
    };

    const analysisOptions = buildArchetypeOptions(
      existingData,
      url,
      evidencePackage
    );

    const persistenceMeta = {
      url,
      framework: 'brand-archetypes',
      contentType: 'brand-archetypes-standalone',
      proposed: proposedData,
    };
    const onComplete = buildPersistenceOnComplete(request, persistenceMeta);

    if (useStreaming) {
      const { streamChunkedAnalysis } = await import('@/lib/streaming-analysis');
      return streamChunkedAnalysis({
        analysisOptions,
        buildResponse: buildResponsePayload,
        frameworkLabel: 'Brand Archetypes',
        onComplete,
      });
    }

    const analysis = await generateArchetypesAnalysis(
      existingData,
      proposedData,
      url,
      evidencePackage
    );
    const analysisRecord = analysis as Record<string, unknown>;
    const payload = buildResponsePayload(analysisRecord);
    return NextResponse.json(
      await enrichResponseWithPersistence(request, {
        ...persistenceMeta,
        analysis: analysisRecord,
      }, payload)
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Brand Archetypes analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
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

  const wordCount: Record<string, number> = {};
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

function buildArchetypeOptions(
  existing: ExistingContentShape,
  url: string,
  evidencePackage: PuppeteerEvidencePackage
) {
  return buildChunkAnalysisOptions(
    'brand-archetypes',
    existing,
    url,
    evidencePackage
  );
}

async function generateArchetypesAnalysis(
  existing: ExistingContentShape,
  proposed: ExistingContentShape | null,
  url: string,
  evidencePackage: PuppeteerEvidencePackage
): Promise<Record<string, unknown>> {
  const { analyzeFrameworkInChunks } = await import(
    '@/lib/chunked-framework-analysis'
  );
  const { generateFrameworkFallbackMarkdown } = await import(
    '@/lib/framework-fallback-generator'
  );

  try {
    return (await analyzeFrameworkInChunks(
      buildArchetypeOptions(existing, url, evidencePackage)
    )) as Record<string, unknown>;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'AI analysis failed';
    const fallbackMarkdown = generateFrameworkFallbackMarkdown({
      framework: 'brand-archetypes',
      url,
      existing,
      proposed,
      errorMessage,
    });
    return { _isFallback: true, fallbackMarkdown, error: errorMessage };
  }
}
