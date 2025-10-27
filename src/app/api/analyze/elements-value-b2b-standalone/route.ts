/**
 * B2B Elements of Value Analysis API
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

    console.log(`🔄 Starting B2B Elements analysis for: ${url}`);

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

  const prompt = `Analyze this website using the B2B Elements of Value framework (42 business value elements):

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

B2B ELEMENTS OF VALUE FRAMEWORK (42 Elements - Bain & Company):

TABLE STAKES (4 elements - Must-haves):
1. meeting_specifications - Conforms to customer's internal specifications
2. acceptable_price - Provides products/services at acceptable price
3. regulatory_compliance - Complies with regulations
4. ethical_standards - Performs activities in ethical manner

FUNCTIONAL VALUE (9 elements):
Economic (2 elements):
5. improved_top_line - Helps customer increase revenue
6. cost_reduction - Reduces cost for customer's organization

Performance (3 elements):
7. product_quality - Provides high-quality goods or services
8. scalability - Expands easily to additional demand/processes
9. innovation - Provides innovative capabilities

Strategic (4 elements):
10. risk_reduction - Protects customer against loss/risk
11. reach - Allows customer to operate in more locations
12. flexibility - Moves beyond standard to allow customization
13. component_quality - Improves perceived quality of customer's products

EASE OF DOING BUSINESS VALUE (18 elements):
Productivity (5 elements):
14. time_savings - Saves time for users/organization
15. reduced_effort - Helps organization get things done with less effort
16. decreased_hassles - Helps customer avoid unnecessary hassles
17. information - Helps users become informed
18. transparency - Provides clear view into customer's organization

Operational (4 elements):
19. organization - Helps users become more organized
20. simplification - Reduces complexity and keeps things simple
21. connection - Connects organizations and users with others
22. integration - Helps integrate different facets of business

Access (4 elements):
23. access - Provides access to resources/services/capabilities
24. availability - Available when and where needed
25. variety - Provides variety of goods/services to choose from
26. configurability - Can be configured to customer's specific needs

Relationship (5 elements):
27. responsiveness - Responds promptly and professionally
28. expertise - Provides know-how for relevant industry
29. commitment - Shows commitment to customer's success
30. stability - Is stable company for foreseeable future
31. cultural_fit - Fits well with customer's culture and people

INDIVIDUAL VALUE (7 elements - Personal benefits for decision-makers):
Career (3 elements):
32. network_expansion - Helps users expand professional network
33. marketability - Makes users more marketable in their field
34. reputational_assurance - Does not jeopardize buyer's reputation

Personal (4 elements):
35. design_aesthetics_b2b - Provides aesthetically pleasing goods/services
36. growth_development - Helps users develop personally
37. reduced_anxiety_b2b - Helps buyers feel more secure
38. fun_perks - Is enjoyable to interact with or rewarding

INSPIRATIONAL VALUE (4 elements):
Purpose (4 elements):
39. purpose - Aligns with customer's organizational purpose
40. vision - Helps customer anticipate direction of markets
41. hope_b2b - Gives buyers hope for future of their organization
42. social_responsibility - Helps customer be more socially responsible

Provide analysis with:
1. Overall B2B Value Score (0-42)
2. Category breakdowns with subcategories (Table Stakes, Functional, Ease of Business, Individual, Inspirational)
3. Subcategory breakdowns (Economic, Performance, Strategic, Productivity, Operational, Access, Relationship, Career, Personal, Purpose)
4. Present elements with evidence
5. Missing elements with recommendations
6. Specific improvements for better B2B value

Return structured analysis with scores and actionable insights in JSON format.`;

  try {
    const result = await analyzeWithGemini(prompt, 'b2b-elements');
    return result;
  } catch (error) {
    return {
      error: 'B2B Elements analysis failed',
      fallbackPrompt: prompt,
    };
  }
}
