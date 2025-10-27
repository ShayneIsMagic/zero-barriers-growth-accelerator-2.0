/**
 * Golden Circle Analysis API
 * Uses Content-Comparison approach for reliability
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

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

    console.log(`🔄 Starting Golden Circle analysis for: ${url}`);

    // Step 1: Use provided existing content (from content-comparison) or fetch it
    let existingData;
    if (existingContent) {
      console.log('📦 Using provided existing content from content-comparison');
      existingData = existingContent;
    } else {
      console.log(
        '🔍 No existing content provided - calling content-comparison API to get scraped data...'
      );
      const compareResponse = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze/compare`,
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

    // Step 3: Run Golden Circle analysis
    console.log('🤖 Step 3: Running Golden Circle analysis...');
    const analysis = await generateGoldenCircleAnalysis(
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
      analysis: analysis,
      message: 'Golden Circle analysis completed',
    });
  } catch (error) {
    console.error('Golden Circle analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Golden Circle analysis failed',
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

// Golden Circle Analysis Function
async function generateGoldenCircleAnalysis(
  existing: any,
  proposed: any,
  url: string,
  _analysisType: string
) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');

  const prompt = `Analyze this website using Simon Sinek's Golden Circle framework (Why, How, What):

URL: ${url}

EXISTING CONTENT:
- Word Count: ${existing.wordCount}
- Title: ${existing.title}
- Meta Description: ${existing.metaDescription}
- Keywords: ${existing.extractedKeywords.slice(0, 10).join(', ')}
- Content: ${existing.cleanText.substring(0, 2000)}

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

GOLDEN CIRCLE FRAMEWORK (Simon Sinek - Complete with WHO):

WHY (Purpose, Cause, Belief):
- What is the organization's purpose?
- What cause does it serve?
- What belief drives it?
- Why does it exist beyond making money?
- What is the organization's reason for being?

HOW (Process, Methodology, Differentiation):
- How does the organization fulfill its purpose?
- What unique process or methodology does it use?
- How is it different from competitors?
- What values guide its actions?
- What is the organization's unique approach?

WHAT (Products, Services, Features):
- What products or services does it offer?
- What specific features or benefits?
- What tangible things does it provide?
- What can customers buy or use?
- What does the organization actually do?

WHO (Target Audience, People, Relationships):
- Who is their ideal customer?
- Who are they serving?
- Who believes what they believe?
- Who is their target audience?
- Who are the people in their testimonials?
- Who benefits from their WHY?
- Who is their team/community?

Provide analysis with:
1. Overall Golden Circle Score (0-40)
2. WHY analysis with score and evidence
3. HOW analysis with score and evidence
4. WHAT analysis with score and evidence
5. WHO analysis with score and evidence
6. Alignment assessment between all four elements
7. Specific improvements for better Golden Circle alignment

Return structured analysis with scores and actionable insights.`;

  try {
    const result = await analyzeWithGemini(prompt, 'golden-circle');
    return result;
  } catch (error) {
    return {
      error: 'Golden Circle analysis failed',
      fallbackPrompt: prompt,
    };
  }
}
