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

// B2C Elements Analysis Function
async function generateB2CAnalysis(
  existing: any,
  proposed: any,
  url: string,
  _analysisType: string
) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');
  const { analyzeWithClaude, isClaudeConfigured } = await import(
    '@/lib/claude-analysis'
  );
  const { generateFrameworkFallbackMarkdown } = await import(
    '@/lib/framework-fallback-generator'
  );

  const prompt = `Analyze this website using the B2C Elements of Value framework (30 consumer value elements):

URL: ${url}

EXISTING CONTENT:
- Word Count: ${existing.wordCount}
- Title: ${existing.title}
- Meta Description: ${existing.metaDescription || existing.seo?.metaDescription || ''}
- Keywords: ${(existing.extractedKeywords || existing.seo?.extractedKeywords || []).slice(0, 10).join(', ')}
- Content: ${existing.cleanText?.substring(0, 2000) || ''}

${
  proposed
    ? `
PROPOSED CONTENT:
- Word Count: ${proposed.wordCount}
- Title: ${proposed.title}
- Meta Description: ${proposed.metaDescription}
- Keywords: ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- Content: ${proposed.cleanText?.substring(0, 2000) || ''}
`
    : 'No proposed content provided - analyze existing only'
}

B2C ELEMENTS OF VALUE FRAMEWORK (30 Elements - Bain & Company):

FUNCTIONAL (14 elements):
1. saves_time, 2. simplifies, 3. makes_money, 4. reduces_effort, 5. reduces_cost,
6. reduces_risk, 7. organizes, 8. integrates, 9. connects, 10. quality,
11. variety, 12. informs, 13. avoids_hassles, 14. sensory_appeal

EMOTIONAL (10 elements):
15. reduces_anxiety, 16. rewards_me, 17. nostalgia, 18. design_aesthetics,
19. badge_value, 20. wellness, 21. therapeutic, 22. fun_entertainment,
23. attractiveness, 24. provides_access

LIFE-CHANGING (5 elements):
25. provides_hope, 26. self_actualization, 27. motivation, 28. heirloom, 29. affiliation_belonging

SOCIAL IMPACT (1 element):
30. self_transcendence

Provide analysis with:
1. Overall B2C Value Score (0-30)
2. Category breakdowns (Functional, Emotional, Life-Changing, Social Impact)
3. Present elements with evidence
4. Missing elements with recommendations
5. Specific improvements for better consumer value

Return structured analysis with scores and actionable insights in JSON format.`;

  // Try Gemini first
  try {
    console.log('🤖 [B2C] Trying Gemini...');
    const result = await analyzeWithGemini(prompt, 'b2c-elements');
    return result;
  } catch (geminiError) {
    const geminiMsg =
      geminiError instanceof Error ? geminiError.message : 'Gemini failed';
    console.log(`⚠️ [B2C] Gemini failed: ${geminiMsg}`);

    // Try Claude as fallback
    if (isClaudeConfigured()) {
      try {
        console.log('🔄 [B2C] Falling back to Claude...');
        const result = await analyzeWithClaude(prompt, 'b2c-elements');
        return result;
      } catch (claudeError) {
        const claudeMsg =
          claudeError instanceof Error ? claudeError.message : 'Claude failed';
        console.log(`⚠️ [B2C] Claude also failed: ${claudeMsg}`);
      }
    }

    // Both AI providers failed — return Markdown fallback
    console.log('📄 [B2C] All AI providers failed, generating Markdown fallback...');
    const errorMessage = geminiMsg;
    const fallbackMarkdown = generateFrameworkFallbackMarkdown({
      framework: 'b2c-elements',
      url,
      existing,
      proposed,
      errorMessage,
    });
    return {
      _isFallback: true,
      fallbackMarkdown,
      error: errorMessage,
    };
  }
}
