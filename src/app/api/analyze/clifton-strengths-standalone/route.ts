/**
 * CliftonStrengths Analysis API
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

    console.log(`🔄 Starting CliftonStrengths analysis for: ${url}`);

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

    // Step 3: Run CliftonStrengths analysis
    console.log('🤖 Step 3: Running CliftonStrengths analysis...');
    const analysis = await generateCliftonStrengthsAnalysis(
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
      analysis: analysis,
      message: 'CliftonStrengths analysis completed'
    });

  } catch (error) {
    console.error('CliftonStrengths analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'CliftonStrengths analysis failed'
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

// CliftonStrengths Analysis Function
async function generateCliftonStrengthsAnalysis(existing: any, proposed: any, url: string, _analysisType: string) {
  const { analyzeWithGemini } = await import('@/lib/free-ai-analysis');

  const prompt = `Analyze this website using the CliftonStrengths framework (34 themes across 4 domains):

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

CLIFTONSTRENGTHS FRAMEWORK (34 Themes - Gallup):

STRATEGIC THINKING (8 themes):
1. analytical - Seeks data and logical reasoning
2. context - Understands the past to plan the future
3. futuristic - Inspired by what could be
4. ideation - Fascinated by ideas
5. input - Collects information and resources
6. intellection - Enjoys thinking and mental activity
7. learner - Has a strong desire to learn
8. strategic - Creates alternative ways to proceed

EXECUTING (9 themes):
9. achiever - Works hard and takes satisfaction from being busy
10. arranger - Can organize and figure out complex situations
11. belief - Has core values that are unchanging
12. consistency - Treats all people equally
13. deliberative - Takes serious care in making decisions
14. discipline - Enjoys routine and structure
15. focus - Takes direction and follows through
16. responsibility - Takes psychological ownership
17. restorative - Enjoys solving problems

INFLUENCING (8 themes):
18. activator - Impatient for action
19. command - Has presence and can take control
20. communication - Enjoys explaining and describing
21. competition - Measures progress against others
22. maximizer - Focuses on strengths to stimulate personal and group excellence
23. self_assurance - Confident in abilities
24. significance - Wants to be recognized and heard
25. woo - Enjoys meeting new people

RELATIONSHIP BUILDING (9 themes):
26. adaptability - Prefers to go with the flow
27. connectedness - Believes all things happen for a reason
28. developer - Recognizes and cultivates potential in others
29. empathy - Senses the feelings of others
30. harmony - Looks for consensus
31. includer - Accepting of others
32. individualization - Intrigued by the unique qualities of each person
33. positivity - Upbeat and can get others excited
34. relator - Enjoys close relationships

Provide analysis with:
1. Overall CliftonStrengths Score (0-34)
2. Domain breakdowns (Strategic Thinking, Executing, Influencing, Relationship Building)
3. Top 5 dominant strengths with evidence
4. Present themes with evidence
5. Missing themes with recommendations
6. Specific improvements for better strength alignment

Return structured analysis with scores and actionable insights.`;

  try {
    const result = await analyzeWithGemini(prompt, 'clifton-strengths');
    return result;
  } catch (error) {
    return {
      error: 'CliftonStrengths analysis failed',
      fallbackPrompt: prompt
    };
  }
}
