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
  let url = ''; // Declare outside try block for error handling
  
  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        },
        { status: 400 }
      );
    }

    const {
      url: requestUrl,
      proposedContent,
      comprehensiveData: clientData, // Data from LocalForage (sent by useAnalysisData hook)
      existingContent: clientExistingContent, // Pre-scraped content from client
      analysisType: _analysisType,
      maxPages = 10,
      maxDepth = 2,
      userId, // Get from auth context in production
      useStored = true, // Check for stored content first
    } = requestBody;
    
    url = requestUrl || ''; // Assign to outer variable for error handling

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL required',
        },
        { status: 400 }
      );
    }

    const isServerless =
      process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    // Step 1: Use client-provided data from LocalForage (highest priority)
    let existingData: any = null;
    let storedSnapshotId: string | null = null;
    let comprehensiveData: any = null;

    if (clientData) {
      // Client sent pre-scraped data from LocalForage — use it directly
      comprehensiveData = clientData;
      existingData = transformComprehensiveData(comprehensiveData);
    }

    // Step 2: Use client-provided existing content
    if (!existingData && clientExistingContent) {
      existingData = clientExistingContent;
    }

    // Step 3: Check database for stored content (if userId provided)
    if (!existingData && useStored && userId) {
      const stored = await ContentStorageService.getLatestSnapshot(url, userId);
      if (stored) {
        comprehensiveData = stored.content;
        existingData = transformComprehensiveData(comprehensiveData);
        storedSnapshotId = stored.id;
      }
    }

    // Step 4: Scrape if no content found from any source
    if (!existingData) {
      if (isServerless) {
        // VERCEL: Use ProductionContentExtractor (fetch-based, no Puppeteer)
        const { ProductionContentExtractor } = await import(
          '@/lib/production-content-extractor'
        );
        const extractor = new ProductionContentExtractor();

        try {
          const extractedData = await extractor.extractContent(url);
          existingData = {
            wordCount: extractedData.wordCount || 0,
            title: extractedData.title || 'Untitled',
            metaDescription: extractedData.metaDescription || '',
            cleanText: extractedData.content || '',
            extractedKeywords: [],
            headings: { h1: [], h2: [], h3: [] },
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          return NextResponse.json(
            {
              success: false,
              error: `Failed to scrape ${url}: ${errorMessage}`,
              details: errorMessage,
            },
            { status: 500 }
          );
        }
      } else {
        // LOCAL: Use PuppeteerComprehensiveCollector (full browser)
        const collector = new PuppeteerComprehensiveCollector({
          maxPages,
          maxDepth,
          timeout: 30000,
        });

        try {
          comprehensiveData = await collector.collectComprehensiveData(url);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          if (
            errorMessage.includes('blocked') ||
            errorMessage.includes('Blocked')
          ) {
            return NextResponse.json(
              {
                success: false,
                error: `Website blocked the scraper: ${url}. Try a different website or contact support.`,
                details: errorMessage,
              },
              { status: 403 }
            );
          }

          throw error;
        }

        existingData = transformComprehensiveData(comprehensiveData);
      }

      // Auto-save to database (if userId provided)
      if (userId && comprehensiveData) {
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

    // Step 3: Extract and structure existing content metadata
    const existingMetadata = extractMetadata(comprehensiveData);

    // Step 4: Process proposed content (if provided)
    let proposedData = null;
    if (proposedContent && proposedContent.trim().length > 0) {
      console.log('📝 Step 4: Processing proposed content...');
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

    // Step 5: Only run AI comparison if proposed content exists
    let comparisonReport = null;
    if (proposedData) {
      console.log('🤖 Step 5: Running AI comparison analysis...');
      try {
        comparisonReport = await generateComparisonReport(
          existingData,
          proposedData,
          url,
          _analysisType || 'full',
          comprehensiveData
        );
      } catch (aiError) {
        console.error('AI comparison generation failed:', aiError);
        const aiErrorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error';
        
        // Check if it's a suspended API key
        const isSuspended = 
          aiErrorMessage.includes('GEMINI_API_KEY_SUSPENDED') ||
          aiErrorMessage.includes('CONSUMER_SUSPENDED') ||
          aiErrorMessage.includes('suspended');
        
        // Return existing content even if AI fails
        return NextResponse.json(
          {
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
            metadata: existingMetadata,
            proposed: proposedData,
            comparison: null,
            error: isSuspended 
              ? 'Gemini API Key Suspended - AI analysis unavailable'
              : 'AI analysis failed, but existing content is available',
            errorType: isSuspended ? 'API_KEY_SUSPENDED' : 'AI_ERROR',
            details: aiErrorMessage,
            storedSnapshotId,
            comprehensive: comprehensiveData,
            message: isSuspended
              ? 'Existing content collected successfully. AI comparison unavailable due to suspended API key. Please check your Google Cloud Console or update your API key.'
              : 'Existing content collected. AI comparison failed.',
            actionRequired: isSuspended
              ? 'Please check your Google Cloud Console, resolve any billing or policy issues, or generate a new API key in your .env.local file.'
              : undefined,
          },
          { status: 200 }
        );
      }
    } else {
      console.log('✅ No proposed content provided - returning existing content only');
    }

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
      metadata: existingMetadata, // All titles, descriptions, tags, keywords
      proposed: proposedData,
      comparison: comparisonReport, // null if no proposed content
      storedSnapshotId, // Return snapshot ID for reference
      comprehensive: comprehensiveData, // Full comprehensive data with SEO/GA4
      message: proposedData 
        ? 'Enhanced comparison analysis completed'
        : 'Existing content collected and ready for analysis',
    });
  } catch (error) {
    console.error('Comparison analysis error:', error);
    
    // Ensure we always return JSON, even for errors
    const errorMessage = error instanceof Error ? error.message : 'Comparison failed';
    
    // Check if error message suggests a blocking or API issue
    if (errorMessage.includes('blocked') || errorMessage.includes('Blocked')) {
      return NextResponse.json(
        {
          success: false,
          error: `Website blocked the scraper: ${url}. Try a different website or contact support.`,
          details: errorMessage,
        },
        { status: 403 }
      );
    }
    
    // Check for suspended API key specifically
    if (
      errorMessage.includes('GEMINI_API_KEY_SUSPENDED') ||
      errorMessage.includes('CONSUMER_SUSPENDED') ||
      errorMessage.includes('suspended') && errorMessage.includes('API')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API Key Suspended',
          message: 'Your Gemini API key has been suspended by Google. The existing content has been collected successfully, but AI comparison analysis is unavailable.',
          details: errorMessage,
          actionRequired: 'Please check your Google Cloud Console, resolve any billing or policy issues, or generate a new API key in your .env.local file.',
          existingContentAvailable: true,
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    if (errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service configuration error. Please check API keys.',
          details: errorMessage,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Extract all metadata (titles, descriptions, tags, keywords) in structured format
 * This is the format for saving and exporting metadata
 */
function extractMetadata(comprehensiveData: any) {
  if (!comprehensiveData?.pages || comprehensiveData.pages.length === 0) {
    return {
      titles: [],
      descriptions: [],
      metaTags: [],
      htmlTags: [],
      keywords: [],
      analytics: [],
    };
  }

  const metadata = {
    // All page titles (with page labels)
    titles: comprehensiveData.pages.map((page: any) => ({
      pageLabel: page.pageLabel || 'Page',
      pageType: page.pageType || 'page',
      url: page.url,
      title: page.title || page.metaTags?.title || '',
      ogTitle: page.metaTags?.ogTitle || '',
      twitterTitle: page.metaTags?.twitterTitle || '',
    })),

    // All meta descriptions (with page labels)
    descriptions: comprehensiveData.pages.map((page: any) => ({
      pageLabel: page.pageLabel || 'Page',
      pageType: page.pageType || 'page',
      url: page.url,
      metaDescription: page.metaDescription || page.metaTags?.description || '',
      ogDescription: page.metaTags?.ogDescription || '',
      twitterDescription: page.metaTags?.twitterDescription || '',
    })),

    // All meta tags (comprehensive, with page labels)
    metaTags: comprehensiveData.pages.map((page: any) => ({
      pageLabel: page.pageLabel || 'Page',
      pageType: page.pageType || 'page',
      url: page.url,
      metaTags: page.metaTags || {},
      allMetaTags: page.metaTags?.allMetaTags || [],
    })),

    // HTML semantic tags (structure analysis, with page labels)
    htmlTags: comprehensiveData.pages.map((page: any) => ({
      pageLabel: page.pageLabel || 'Page',
      pageType: page.pageType || 'page',
      url: page.url,
      semanticTags: page.tags?.semanticTags || {},
      semanticTagDetails: page.tags?.semanticTagDetails || [],
      totalSemanticTags: page.tags?.totalSemanticTags || 0,
    })),

    // All keywords (from all sources, with page labels)
    keywords: comprehensiveData.pages.map((page: any) => ({
      pageLabel: page.pageLabel || 'Page',
      pageType: page.pageType || 'page',
      url: page.url,
      metaKeywords: page.keywords?.metaKeywords || [],
      contentKeywords: page.keywords?.contentKeywords || [],
      headingKeywords: page.keywords?.headingKeywords || [],
      altTextKeywords: page.keywords?.altTextKeywords || [],
      allKeywords: page.keywords?.allKeywords || [],
      keywordFrequency: page.keywords?.keywordFrequency || {},
    })),

    // Analytics data (with page labels)
    analytics: comprehensiveData.pages.map((page: any) => ({
      pageLabel: page.pageLabel || 'Page',
      pageType: page.pageType || 'page',
      url: page.url,
      googleAnalytics4: page.analytics?.googleAnalytics4 || {},
      googleTagManager: page.analytics?.googleTagManager || {},
      facebookPixel: page.analytics?.facebookPixel || {},
      otherAnalytics: page.analytics?.otherAnalytics || [],
    })),
  };

  return metadata;
}

/**
 * Transform comprehensive collection data to match existing format
 * Extracts all SEO metadata from comprehensive collector
 */
function transformComprehensiveData(comprehensiveData: any) {
  const allText = comprehensiveData.pages
    ? comprehensiveData.pages
        .map((page: any) => page.content?.text || '')
        .join('\n\n--- PAGE BREAK ---\n\n')
    : '';

  const allHeadings = comprehensiveData.pages
    ? {
        h1: comprehensiveData.pages.flatMap(
          (page: any) => page.headings?.h1 || []
        ),
        h2: comprehensiveData.pages.flatMap(
          (page: any) => page.headings?.h2 || []
        ),
        h3: comprehensiveData.pages.flatMap(
          (page: any) => page.headings?.h3 || []
        ),
      }
    : { h1: [], h2: [], h3: [] };

  const homepage = comprehensiveData.pages?.[0] || {};

  // Extract keywords from comprehensive data if available
  const allKeywords =
    homepage.keywords?.allKeywords ||
    extractKeywordsFromText(allText);

  // Extract SEO metadata from homepage
  const metaTags = homepage.metaTags || {};

  return {
    title: metaTags.title || homepage.title || comprehensiveData.url,
    metaDescription:
      metaTags.description || homepage.metaDescription || '',
    wordCount:
      comprehensiveData.content?.totalWords ||
      allText.split(/\s+/).length,
    extractedKeywords: allKeywords,
    headings: allHeadings,
    cleanText: allText,
    url: comprehensiveData.url,
    seo: {
      metaTitle: metaTags.title || homepage.title || '',
      metaDescription: metaTags.description || homepage.metaDescription || '',
      metaKeywords: metaTags.keywords || '',
      canonical: metaTags.canonical || '',
      ogTitle: metaTags.ogTitle || '',
      ogDescription: metaTags.ogDescription || '',
      ogImage: metaTags.ogImage || '',
      twitterCard: metaTags.twitterCard || '',
      twitterTitle: metaTags.twitterTitle || '',
      twitterDescription: metaTags.twitterDescription || '',
      robots: metaTags.robots || '',
      extractedKeywords: allKeywords,
      headings: allHeadings,
    },
    // Include full metadata for comparison
    metaTags: metaTags,
    analytics: homepage.analytics || {},
    keywords: homepage.keywords || {},
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
  const { analyzeWithClaude, isClaudeConfigured } = await import(
    '@/lib/claude-analysis'
  );

  // Extract SEO metadata from comprehensive data
  const homepage = comprehensiveData?.pages?.[0] || {};
  const existingMetaTags = homepage.metaTags || {};
  const existingAnalytics = homepage.analytics || {};
  const existingKeywords = homepage.keywords || {};

  // Build comprehensive SEO data section
  const seoDataSection = comprehensiveData?.pages
    ? `
=== EXISTING SITE SEO METADATA (ACTUAL COLLECTED DATA) ===

META TAGS (From ${comprehensiveData.pages.length} page(s)):
- Title: ${existingMetaTags.title || existing.title || 'Not found'}
- Meta Description: ${existingMetaTags.description || existing.metaDescription || 'Not found'}
- Meta Keywords: ${existingMetaTags.keywords || 'Not found'}
- Canonical URL: ${existingMetaTags.canonical || 'Not found'}
- Open Graph Title: ${existingMetaTags.ogTitle || 'Not found'}
- Open Graph Description: ${existingMetaTags.ogDescription || 'Not found'}
- Open Graph Image: ${existingMetaTags.ogImage || 'Not found'}
- Twitter Card: ${existingMetaTags.twitterCard || 'Not found'}
- Twitter Title: ${existingMetaTags.twitterTitle || 'Not found'}
- Twitter Description: ${existingMetaTags.twitterDescription || 'Not found'}
- Robots Meta: ${existingMetaTags.robots || 'Not found'}
- Language: ${existingMetaTags.language || 'Not found'}
- Charset: ${existingMetaTags.charset || 'Not found'}

ANALYTICS DETECTED:
- Google Analytics 4 IDs: ${existingAnalytics.googleAnalytics4?.measurementIds?.join(', ') || 'None detected'}
- Google Tag Manager IDs: ${existingAnalytics.googleTagManager?.containerIds?.join(', ') || 'None detected'}
- Facebook Pixel: ${existingAnalytics.facebookPixel?.pixelId || 'None detected'}

KEYWORDS EXTRACTED (From actual page content):
- Meta Keywords: ${existingKeywords.metaKeywords?.slice(0, 10).join(', ') || 'None'}
- Content Keywords: ${existingKeywords.contentKeywords?.slice(0, 15).join(', ') || 'None'}
- Heading Keywords: ${existingKeywords.headingKeywords?.slice(0, 10).join(', ') || 'None'}
- Alt Text Keywords: ${existingKeywords.altTextKeywords?.slice(0, 10).join(', ') || 'None'}
- All Unique Keywords: ${existingKeywords.allKeywords?.slice(0, 20).join(', ') || 'None'}

SITE STRUCTURE:
- Total Pages Analyzed: ${comprehensiveData.pages.length}
- Total Words: ${comprehensiveData.content?.totalWords || existing.wordCount}
- Average Words Per Page: ${comprehensiveData.content?.averageWordsPerPage || 'N/A'}
- Performance Score: ${comprehensiveData.performance?.overallScore || 'N/A'}
- SEO Score: ${comprehensiveData.seo?.overallScore || 'N/A'}

HEADINGS STRUCTURE:
- H1 Tags: ${homepage.headings?.h1?.join(' | ') || 'None found'}
- H2 Tags: ${homepage.headings?.h2?.slice(0, 5).join(' | ') || 'None found'}
- H3 Tags: ${homepage.headings?.h3?.slice(0, 5).join(' | ') || 'None found'}
`
    : '';

  // Extract proposed content SEO elements
  const proposedTitle = proposed?.title || extractTitle(proposed?.cleanText || '');
  const proposedMetaDesc = proposed?.metaDescription || extractMetaDescription(proposed?.cleanText || '');
  const proposedKeywords = proposed?.extractedKeywords || extractKeywordsFromText(proposed?.cleanText || '');

  const prompt = `You are an expert SEO analyst. Compare EXISTING website content vs. PROPOSED new content.

CRITICAL INSTRUCTIONS:
- ONLY use the actual data provided below. DO NOT fabricate, hallucinate, or invent any information.
- Base ALL analysis on the EXACT metadata, keywords, and content provided.
- If data is missing or "Not found", state that clearly - do not make assumptions.
- Focus on SEO elements: meta descriptions, titles, tags, keyword usage, and keyword stuffing detection.

=== URL BEING ANALYZED ===
${url}

${seoDataSection}

=== EXISTING CONTENT TEXT (First 3000 characters) ===
${existing.cleanText?.substring(0, 3000) || 'No content text available'}

${
  proposed
    ? `
=== PROPOSED NEW CONTENT ===

PROPOSED TITLE:
${proposedTitle || 'Not provided'}

PROPOSED META DESCRIPTION:
${proposedMetaDesc || 'Not provided'}

PROPOSED CONTENT TEXT (First 3000 characters):
${proposed.cleanText?.substring(0, 3000) || 'No content provided'}

PROPOSED KEYWORDS (Extracted):
${proposedKeywords?.slice(0, 15).join(', ') || 'None extracted'}

PROPOSED HEADINGS:
${JSON.stringify(proposed.headings || {}, null, 2)}
`
    : `
=== NO PROPOSED CONTENT PROVIDED ===
Analyze only the existing content for SEO optimization opportunities.
`
}

=== REQUIRED ANALYSIS OUTPUT ===

Provide a structured JSON response with the following sections:

1. SEO METADATA COMPARISON:
   - Title Comparison: Existing vs Proposed (length, keyword inclusion, clarity)
   - Meta Description Comparison: Existing vs Proposed (length, keyword inclusion, call-to-action)
   - Keyword Analysis: Which version uses keywords more naturally?
   - Keyword Stuffing Detection: Flag any unnatural keyword repetition in either version
   - Tag Structure: Compare heading hierarchy (H1, H2, H3) and semantic structure

2. CONTENT QUALITY COMPARISON:
   - Word Count: Existing (${existing.wordCount}) vs Proposed (${proposed?.wordCount || 'N/A'})
   - Readability: Which is clearer and more engaging?
   - Value Proposition: Which communicates value better?
   - Call-to-Action: Which drives action better?

3. SEO RISK ASSESSMENT:
   - Keyword Stuffing Risk: Score 0-10 (0 = no risk, 10 = high risk) for both versions
   - Over-optimization: Flag any unnatural keyword placement
   - Missing SEO Elements: What's missing in each version?
   - Duplicate Content Risk: Any concerns about duplicate content?

4. RECOMMENDATIONS:
   - Keep Existing: Yes/No and why
   - Use Proposed: Yes/No and why
   - Blend Both: Specific suggestions for combining best elements
   - Priority Actions: Top 3-5 specific improvements needed

5. SPECIFIC IMPROVEMENTS:
   - For Existing: List specific changes to improve SEO
   - For Proposed: List specific changes to improve SEO
   - Meta Description Optimization: Suggested improvements
   - Title Optimization: Suggested improvements
   - Keyword Optimization: Suggested improvements

CRITICAL: You MUST return ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON structure.

Return as valid JSON with this EXACT structure:
{
  "seoComparison": {
    "title": { "existing": "...", "proposed": "...", "recommendation": "..." },
    "metaDescription": { "existing": "...", "proposed": "...", "recommendation": "..." },
    "keywordAnalysis": { "existing": [...], "proposed": [...], "naturalUsage": "..." },
    "keywordStuffing": { "existing": { "risk": 0-10, "issues": [...] }, "proposed": { "risk": 0-10, "issues": [...] } },
    "tagStructure": { "existing": "...", "proposed": "...", "recommendation": "..." }
  },
  "contentQuality": {
    "wordCount": { "existing": number, "proposed": number, "recommendation": "..." },
    "readability": { "existing": "...", "proposed": "...", "winner": "..." },
    "valueProposition": { "existing": "...", "proposed": "...", "winner": "..." },
    "callToAction": { "existing": "...", "proposed": "...", "winner": "..." }
  },
  "seoRiskAssessment": {
    "keywordStuffing": { "existing": { "score": 0-10, "issues": [...] }, "proposed": { "score": 0-10, "issues": [...] } },
    "overOptimization": { "existing": [...], "proposed": [...] },
    "missingElements": { "existing": [...], "proposed": [...] },
    "duplicateContentRisk": "..."
  },
  "recommendations": {
    "keepExisting": { "yes": boolean, "reason": "..." },
    "useProposed": { "yes": boolean, "reason": "..." },
    "blendBoth": { "suggestions": [...] },
    "priorityActions": [...]
  },
  "improvements": {
    "existing": [...],
    "proposed": [...],
    "metaDescription": { "existing": "...", "proposed": "..." },
    "title": { "existing": "...", "proposed": "..." },
    "keywords": { "existing": "...", "proposed": "..." }
  }
}

IMPORTANT: 
- Return ONLY the JSON object, no markdown code blocks, no explanations
- Use actual data from the content provided above
- If data is missing, use "Not found" or empty arrays/lists
- Do not fabricate or hallucinate any information
- All scores must be numbers (0-10 for risk scores)
- All arrays must be valid JSON arrays`;

  // Try Gemini first, then Claude fallback
  let lastError: string = '';

  try {
    console.log('🤖 [Compare] Trying Gemini...');
    const result = await analyzeWithGemini(prompt, 'comparison');
    return parseAIResult(result);
  } catch (geminiError) {
    lastError = geminiError instanceof Error ? geminiError.message : 'Gemini failed';
    console.log(`⚠️ [Compare] Gemini failed: ${lastError}`);
  }

  // Gemini failed — try Claude as fallback
  if (isClaudeConfigured()) {
    try {
      console.log('🔄 [Compare] Falling back to Claude...');
      const result = await analyzeWithClaude(prompt, 'comparison');
      return parseAIResult(result);
    } catch (claudeError) {
      const claudeMsg = claudeError instanceof Error ? claudeError.message : 'Claude failed';
      console.log(`⚠️ [Compare] Claude also failed: ${claudeMsg}`);
    }
  } else {
    console.log('⚠️ [Compare] Claude not configured, skipping fallback');
  }

  // Both AI providers failed
  return {
    error: 'AI comparison failed — both Gemini and Claude unavailable',
    details: lastError,
  };
}

function parseAIResult(result: any): any {
  if (typeof result === 'object' && result !== null) {
    return result;
  }

  if (typeof result === 'string') {
    let jsonText = result.trim();
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch { /* fall through */ }
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch { /* fall through */ }
    }

    return {
      raw: result,
      error: 'Failed to parse JSON response',
    };
  }

  return {
    error: 'Unexpected response format',
    raw: result,
  };
}
