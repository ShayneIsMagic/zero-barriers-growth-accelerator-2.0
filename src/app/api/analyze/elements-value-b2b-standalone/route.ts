/**
 * B2B Elements of Value Analysis API
 * Uses content-comparison pattern with side-by-side analysis
 */

import { UniversalPuppeteerScraper } from '@/lib/universal-puppeteer-scraper';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { url, proposedContent, analysisType: _analysisType } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL required'
      }, { status: 400 });
    }

    console.log(`🔄 Starting B2B Elements of Value analysis for: ${url}`);

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
          headings: extractHeadings(proposedContent)
        }
      };
    }

    // Step 3: Run B2B Elements analysis
    console.log('🤖 Step 3: Running B2B Elements of Value analysis...');
    const analysisResult = await generateB2BAnalysis(
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
        url: existingData.url
      },
      proposed: proposedData,
      analysis: analysisResult,
      message: 'B2B Elements of Value analysis completed'
    });

  } catch (error) {
    console.error('B2B Elements of Value analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'B2B Elements of Value analysis failed'
    }, { status: 500 });
  }
}

// Helper functions
function extractTitle(content: string): string {
  const lines = content.split('\n');
  return lines[0]?.trim().substring(0, 60) || 'Proposed Title';
}

function extractMetaDescription(content: string): string {
  const lines = content.split('\n');
  return lines.slice(0, 3).join(' ').trim().substring(0, 160) || 'Proposed description';
}

function extractKeywordsFromText(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4);

  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

function extractHeadings(content: string): { h1: string[]; h2: string[]; h3: string[] } {
  const lines = content.split('\n');
  return {
    h1: lines.filter(l => l.startsWith('# ')).map(l => l.replace('# ', '').trim()),
    h2: lines.filter(l => l.startsWith('## ')).map(l => l.replace('## ', '').trim()),
    h3: lines.filter(l => l.startsWith('### ')).map(l => l.replace('### ', '').trim())
  };
}

async function generateB2BAnalysis(existing: any, proposed: any, url: string, _analysisType: string) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');

  const prompt = `Analyze website content using B2B Elements of Value framework:

URL: ${url}

EXISTING CONTENT:
- Word Count: ${existing.wordCount}
- Title: ${existing.title}
- Meta Description: ${existing.metaDescription}
- Keywords: ${existing.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- Content: ${existing.cleanText.substring(0, 2000)}

${proposed ? `
PROPOSED CONTENT:
- Word Count: ${proposed.wordCount}
- Title: ${proposed.title}
- Meta Description: ${proposed.metaDescription}
- Keywords: ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- Content: ${proposed.cleanText.substring(0, 2000)}
` : 'No proposed content provided - analyze existing only'}

Analyze using B2B Elements of Value framework (40 elements across 5 categories):

1. TABLE STAKES (4 elements): meeting_specifications, acceptable_price, regulatory_compliance, ethical_standards
2. FUNCTIONAL (9 elements): improved_top_line, cost_reduction, product_quality, scalability, innovation, risk_reduction, reach, flexibility, component_quality
3. EASE OF DOING BUSINESS (17 elements): time_savings, reduced_effort, decreased_hassles, information, transparency, organization, simplification, connection, integration, access, availability, variety, configurability, responsiveness, expertise, commitment, stability, cultural_fit
4. INDIVIDUAL (7 elements): network_expansion, marketability, reputational_assurance, design_aesthetics_b2b, growth_development, reduced_anxiety_b2b, fun_perks
5. INSPIRATIONAL (3 elements): vision, hope_b2b, social_responsibility

For each element, provide:
- Present (Yes/No)
- Evidence (specific text snippets)
- Score (0-100)
- Revenue opportunity

Return structured analysis with overall scores and recommendations.`;

  try {
    const result = await analyzeWithGemini(prompt, 'b2b-elements');
    return result;
  } catch (error) {
    return {
      error: 'B2B Elements analysis failed',
      fallbackPrompt: prompt
    };
  }
}
