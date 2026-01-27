/**
 * Content Comparison API
 * Compare existing website content vs. proposed new content
 * Uses PuppeteerComprehensiveCollector (enhanced) for multi-page scraping with SEO/GA4
 */

import { PuppeteerComprehensiveCollector } from '@/lib/puppeteer-comprehensive-collector';
import { ContentStorageService } from '@/lib/services/content-storage.service';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // Increased for multi-page scraping

export async function POST(request: NextRequest) {
  try {
    const {
      url,
      proposedContent,
      analysisType: _analysisType,
      maxPages = 10,
      maxDepth = 2,
      userId, // Get from auth context in production
      useStored = true, // Check for stored content first
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

    console.log(`🔄 Starting enhanced comparison analysis for: ${url}`);
    console.log(`📊 Max pages: ${maxPages}, Max depth: ${maxDepth}`);

    // Step 1: Check for stored content first (if enabled and userId provided)
    let existingData: any = null;
    let storedSnapshotId: string | null = null;
    let comprehensiveData: any = null;

    if (useStored && userId) {
      console.log('📦 Checking for stored content snapshot...');
      const stored = await ContentStorageService.getLatestSnapshot(url, userId);
      if (stored) {
        console.log('✅ Using stored content snapshot');
        comprehensiveData = stored.content;
        existingData = transformComprehensiveData(comprehensiveData);
        storedSnapshotId = stored.id;
      }
    }

    // Step 2: Scrape if no stored content found
    if (!existingData) {
      console.log(
        '🔍 No stored content found, scraping with enhanced collector...'
      );
      const collector = new PuppeteerComprehensiveCollector({
        maxPages,
        maxDepth,
        timeout: 30000,
      });

      comprehensiveData = await collector.collectComprehensiveData(url);

      // Transform to existing format for compatibility
      existingData = transformComprehensiveData(comprehensiveData);

      // Auto-save to database (if userId provided)
      if (userId) {
        console.log('💾 Auto-saving scraped content to database...');
        storedSnapshotId = await ContentStorageService.storeComprehensiveData(
          url,
          comprehensiveData,
          userId,
          comprehensiveData.pages[0]?.title
        );
        if (storedSnapshotId) {
          console.log(
            `✅ Content saved with snapshot ID: ${storedSnapshotId}`
          );
        }
      }
    }

    // Step 3: Process proposed content (if provided)
    let proposedData = null;
    if (proposedContent && proposedContent.trim().length > 0) {
      console.log('📝 Step 3: Processing proposed content...');
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

    // Step 4: Run AI comparison analysis
    console.log('🤖 Step 4: Running AI comparison analysis...');
    const comparisonReport = await generateComparisonReport(
      existingData,
      proposedData,
      url,
      _analysisType || 'full',
      comprehensiveData
    );

    return NextResponse.json({
      success: true,
      existing: {
        title: existingData.title,
        metaDescription: existingData.metaDescription,
        wordCount: existingData.wordCount,
        extractedKeywords: existingData.extractedKeywords,
        headings: existingData.headings,
        cleanText: existingData.cleanText,
        url: existingData.url,
      },
      proposed: proposedData,
      comparison: comparisonReport,
      storedSnapshotId, // Return snapshot ID for reference
      comprehensive: comprehensiveData, // Full comprehensive data with SEO/GA4
      message: 'Enhanced comparison analysis completed',
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

/**
 * Transform comprehensive collection data to match existing format
 */
function transformComprehensiveData(comprehensiveData: any) {
  const allText = comprehensiveData.pages
    .map((page: any) => page.content?.text || '')
    .join('\n\n--- PAGE BREAK ---\n\n');

  const allHeadings = {
    h1: comprehensiveData.pages.flatMap(
      (page: any) => page.headings?.h1 || []
    ),
    h2: comprehensiveData.pages.flatMap(
      (page: any) => page.headings?.h2 || []
    ),
    h3: comprehensiveData.pages.flatMap(
      (page: any) => page.headings?.h3 || []
    ),
  };

  const homepage = comprehensiveData.pages[0] || comprehensiveData.pages[0];

  const allKeywords = extractKeywordsFromText(allText);

  return {
    title: homepage?.title || comprehensiveData.url,
    metaDescription: homepage?.metaDescription || '',
    wordCount: comprehensiveData.content?.totalWords || 0,
    extractedKeywords: allKeywords,
    headings: allHeadings,
    cleanText: allText,
    url: comprehensiveData.url,
    seo: {
      metaTitle: homepage?.title || '',
      metaDescription: homepage?.metaDescription || '',
      extractedKeywords: allKeywords,
      headings: allHeadings,
    },
  };
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

async function generateComparisonReport(
  existing: any,
  proposed: any,
  url: string,
  _analysisType: string,
  comprehensiveData?: any
) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');

  const pagesInfo = comprehensiveData?.pages
    ? `\n\nCOMPREHENSIVE SITE DATA:
- Total Pages Analyzed: ${comprehensiveData.pages.length}
- Site Map Depth: ${comprehensiveData.siteMap.depth}
- Performance Score: ${comprehensiveData.performance.overallScore}
- SEO Score: ${comprehensiveData.seo.overallScore}
- Total Words Across Site: ${comprehensiveData.content.totalWords}
- Average Words Per Page: ${comprehensiveData.content.averageWordsPerPage}
- GA4 IDs Found: ${comprehensiveData.pages
      .flatMap((p: any) => p.analytics?.googleAnalytics4?.measurementIds || [])
      .join(', ') || 'None'}
- All Keywords: ${comprehensiveData.pages
      .flatMap((p: any) => p.keywords?.allKeywords || [])
      .slice(0, 20)
      .join(', ')}`
    : '';

  const prompt = `Compare existing website content vs. proposed new content:

URL: ${url}

EXISTING CONTENT (Multi-Page Analysis):
- Word Count: ${existing.wordCount}
- Title: ${existing.title}
- Meta Description: ${existing.metaDescription}
- Keywords: ${existing.extractedKeywords.slice(0, 10).join(', ')}
- Content: ${existing.cleanText.substring(0, 2000)}
${pagesInfo}

${
  proposed
    ? `
PROPOSED CONTENT:
- Word Count: ${proposed.wordCount}
- Title: ${proposed.title}
- Meta Description: ${proposed.metaDescription}
- Keywords: ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- Content: ${proposed.cleanText.substring(0, 2000)}
`
    : 'No proposed content provided - analyze existing only'
}

Provide side-by-side comparison:
1. SEO Impact: How would proposed content affect search rankings?
2. Value Proposition: Which version communicates value better?
3. Keywords: Which targets better keywords?
4. Readability: Which is clearer and more engaging?
5. Call-to-Action: Which drives action better?
6. Multi-Page Analysis: How does the proposed content fit with the overall site structure?
7. Overall Recommendation: Keep existing, use proposed, or blend both?

Return structured comparison with scores and specific improvements.`;

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
