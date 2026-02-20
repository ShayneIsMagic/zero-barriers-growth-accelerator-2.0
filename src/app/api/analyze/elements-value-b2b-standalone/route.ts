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

// B2B Elements Analysis Function
async function generateB2BAnalysis(
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

  const prompt = `Analyze this website using the B2B Elements of Value framework (42 business value elements):

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

B2B ELEMENTS OF VALUE FRAMEWORK (42 Elements - Bain & Company):

TABLE STAKES (4 elements - Must-haves):
1. meeting_specifications, 2. acceptable_price, 3. regulatory_compliance, 4. ethical_standards

FUNCTIONAL VALUE (9 elements):
5. improved_top_line, 6. cost_reduction, 7. product_quality, 8. scalability,
9. innovation, 10. risk_reduction, 11. reach, 12. flexibility, 13. component_quality

EASE OF DOING BUSINESS VALUE (18 elements):
14. time_savings, 15. reduced_effort, 16. decreased_hassles, 17. information,
18. transparency, 19. organization, 20. simplification, 21. connection,
22. integration, 23. access, 24. availability, 25. variety, 26. configurability,
27. responsiveness, 28. expertise, 29. commitment, 30. stability, 31. cultural_fit

INDIVIDUAL VALUE (7 elements):
32. network_expansion, 33. marketability, 34. reputational_assurance,
35. design_aesthetics_b2b, 36. growth_development, 37. reduced_anxiety_b2b, 38. fun_perks

INSPIRATIONAL VALUE (4 elements):
39. purpose, 40. vision, 41. hope_b2b, 42. social_responsibility

Provide analysis with:
1. Overall B2B Value Score (0-42)
2. Category breakdowns with subcategories
3. Present elements with evidence
4. Missing elements with recommendations
5. Specific improvements for better B2B value

Return structured analysis with scores and actionable insights in JSON format.`;

  // Try Gemini first
  try {
    console.log('🤖 [B2B] Trying Gemini...');
    const result = await analyzeWithGemini(prompt, 'b2b-elements');
    return result;
  } catch (geminiError) {
    const geminiMsg =
      geminiError instanceof Error ? geminiError.message : 'Gemini failed';
    console.log(`⚠️ [B2B] Gemini failed: ${geminiMsg}`);

    // Try Claude as fallback
    if (isClaudeConfigured()) {
      try {
        console.log('🔄 [B2B] Falling back to Claude...');
        const result = await analyzeWithClaude(prompt, 'b2b-elements');
        return result;
      } catch (claudeError) {
        const claudeMsg =
          claudeError instanceof Error ? claudeError.message : 'Claude failed';
        console.log(`⚠️ [B2B] Claude also failed: ${claudeMsg}`);
      }
    }

    // Both AI providers failed — return Markdown fallback
    console.log('📄 [B2B] All AI providers failed, generating Markdown fallback...');
    const errorMessage = geminiMsg;
    const fallbackMarkdown = generateFrameworkFallbackMarkdown({
      framework: 'b2b-elements',
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
