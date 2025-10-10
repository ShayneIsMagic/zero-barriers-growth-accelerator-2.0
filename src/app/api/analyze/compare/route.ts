/**
 * Content Comparison API
 * Compare existing website content vs. proposed new content
 * Side-by-side analysis showing improvements
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsiteContent } from '@/lib/reliable-content-scraper';

export async function POST(request: NextRequest) {
  try {
    const { url, proposedContent, analysisType } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL required'
      }, { status: 400 });
    }

    console.log(`🔄 Starting comparison analysis for: ${url}`);

    // Step 1: Get existing content from live website
    console.log('📊 Step 1: Scraping existing website content...');
    const existingData = await scrapeWebsiteContent(url);

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
        headings: extractHeadings(proposedContent)
      };
    }

    // Step 3: Run AI comparison analysis
    console.log('🤖 Step 3: Running AI comparison analysis...');
    const comparisonReport = await generateComparisonReport(
      existingData,
      proposedData,
      url,
      analysisType || 'full'
    );

    return NextResponse.json({
      success: true,
      existing: existingData,
      proposed: proposedData,
      comparison: comparisonReport,
      message: 'Comparison analysis completed'
    });

  } catch (error) {
    console.error('Comparison analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Comparison failed'
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

async function generateComparisonReport(existing: any, proposed: any, url: string, analysisType: string) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');
  
  const prompt = `Compare existing website content vs. proposed new content:

URL: ${url}

EXISTING CONTENT:
- Word Count: ${existing.wordCount}
- Title: ${existing.title}
- Meta Description: ${existing.metaDescription}
- Keywords: ${existing.extractedKeywords.slice(0, 10).join(', ')}
- Content: ${existing.cleanText.substring(0, 2000)}

${proposed ? `
PROPOSED CONTENT:
- Word Count: ${proposed.wordCount}
- Title: ${proposed.title}
- Meta Description: ${proposed.metaDescription}
- Keywords: ${proposed.extractedKeywords.slice(0, 10).join(', ')}
- Content: ${proposed.cleanText.substring(0, 2000)}
` : 'No proposed content provided - analyze existing only'}

Provide side-by-side comparison:
1. SEO Impact: How would proposed content affect search rankings?
2. Value Proposition: Which version communicates value better?
3. Keywords: Which targets better keywords?
4. Readability: Which is clearer and more engaging?
5. Call-to-Action: Which drives action better?
6. Overall Recommendation: Keep existing, use proposed, or blend both?

Return structured comparison with scores and specific improvements.`;

  try {
    const result = await analyzeWithGemini(prompt, 'comparison');
    return result;
  } catch (error) {
    return {
      error: 'AI comparison failed',
      fallbackPrompt: prompt
    };
  }
}

