/**
 * B2C Elements of Value Analysis API
 * Uses Content-Comparison approach for reliability
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { url, proposedContent, analysisType: _analysisType, existingContent } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL required'
      }, { status: 400 });
    }

    console.log(`🔄 Starting B2C Elements analysis for: ${url}`);

    // Step 1: Use provided existing content (from content-comparison) or fetch it
    let existingData;
    if (existingContent) {
      console.log('📦 Using provided existing content from content-comparison');
      existingData = existingContent;
    } else {
      console.log('🔍 No existing content provided - calling content-comparison API to get scraped data...');
      const compareResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, proposedContent: '' })
      });

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
          headings: extractHeadings(proposedContent)
        }
      };
    }

    // Step 3: Run B2C Elements analysis
    console.log('🤖 Step 3: Running B2C Elements analysis...');
    const analysis = await generateB2CAnalysis(
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
      comparison: analysis,
      message: 'B2C Elements analysis completed'
    });

  } catch (error) {
    console.error('B2C Elements analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'B2C Elements analysis failed'
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

  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function extractHeadings(content: string): string[] {
  const lines = content.split('\n');
  return lines
    .filter(line => line.trim().startsWith('#') || line.trim().match(/^[A-Z][^.!?]*$/))
    .map(line => line.trim().replace(/^#+\s*/, ''))
    .slice(0, 10);
}

// B2C Elements Analysis Function
async function generateB2CAnalysis(existing: any, proposed: any, url: string, _analysisType: string) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');

  const prompt = `Analyze this website using the B2C Elements of Value framework (30 consumer value elements):

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
- Keywords: ${proposed.extractedKeywords?.slice(0, 10).join(', ') || 'None'}
- Content: ${proposed.cleanText.substring(0, 2000)}
` : 'No proposed content provided - analyze existing only'}

B2C ELEMENTS OF VALUE FRAMEWORK (30 Elements - Bain & Company):

FUNCTIONAL (14 elements):
1. saves_time - Helps complete tasks faster
2. simplifies - Makes things easier
3. makes_money - Helps earn income
4. reduces_effort - Minimizes work required
5. reduces_cost - Saves money
6. reduces_risk - Minimizes negative outcomes
7. organizes - Helps structure tasks
8. integrates - Connects systems
9. connects - Brings people together
10. quality - Superior standards
11. variety - Offers choices
12. informs - Provides knowledge
13. avoids_hassles - Avoiding or reducing hassles and inconveniences
14. sensory_appeal - Appealing in taste, smell, hearing and other senses

EMOTIONAL (10 elements):
15. reduces_anxiety - Peace of mind
16. rewards_me - Incentives/recognition
17. nostalgia - Positive memories
18. design_aesthetics - Visual appeal
19. badge_value - Status signal
20. wellness - Health promotion
21. therapeutic - Stress relief
22. fun_entertainment - Enjoyment
23. attractiveness - Personal appeal
24. provides_access - Exclusive opportunities

LIFE CHANGING (5 elements):
25. provides_hope - Inspires optimism
26. self_actualization - Achieve potential
27. motivation - Inspires action
28. heirloom - Legacy value
29. affiliation - Sense of belonging

SOCIAL IMPACT (1 element):
30. self_transcendence - Greater good

Provide analysis with:
1. Overall B2C Value Score (0-30)
2. Category breakdowns (Functional, Emotional, Life-Changing, Social Impact)
3. Present elements with evidence
4. Missing elements with recommendations
5. Specific improvements for better consumer value

Return structured analysis with scores and actionable insights.`;

  try {
    const result = await analyzeWithGemini(prompt, 'b2c-elements');
    return result;
  } catch (error) {
    return {
      error: 'B2C Elements analysis failed',
      fallbackPrompt: prompt
    };
  }
}
