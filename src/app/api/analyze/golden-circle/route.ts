import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { _url, content } = body;

    if (!_url || !content) {
      return NextResponse.json({
        success: false,
        error: 'URL and content are required'
      }, { status: 400 });
    }

    console.log(`🎯 Starting Golden Circle analysis for: ${_url}`);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
# GOLDEN CIRCLE ANALYSIS (Simon Sinek)

Analyze the following website content using Simon Sinek's Golden Circle framework. Extract specific details and provide scores for each dimension.

**URL:** ${_url}
**Content to Analyze:**
${JSON.stringify(content, null, 2)}

## ANALYSIS REQUIREMENTS

### 1. WHY (Purpose & Belief)
- Extract the specific mission statement, core purpose, or driving belief
- Quote exact phrases from hero sections, about pages, mission statements
- Look for emotional core and driving motivation
- Score: 0-10 (0 = not present, 10 = exceptionally clear)

### 2. HOW (Methodology & Process)
- Identify the unique methodology, process, or approach
- Look for specific frameworks, methodologies, processes mentioned
- Extract exact methodology names and systematic approaches
- Score: 0-10 (0 = not present, 10 = exceptionally clear)

### 3. WHAT (Products & Services)
- List the specific products, services, or solutions offered
- Extract exact product names, service categories, specific offerings
- Look for clear value propositions
- Score: 0-10 (0 = not present, 10 = exceptionally clear)

### 4. WHO (Target Audience & Testimonials)
- Analyze testimonials, case studies, client logos, success stories
- Extract specific client names, company names, job titles
- Identify success metrics and specific results mentioned
- Score: 0-10 (0 = not present, 10 = exceptionally clear)

## SCORING CRITERIA
- 0: Not present or mentioned
- 1-3: Poor/Weak - Major improvements needed
- 4-6: Fair/Average - Some strengths, room for improvement
- 7-8: Good/Strong - Well-executed with minor gaps
- 9-10: Excellent/Outstanding - Best practice, highly effective

## REQUIRED OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "why": {
    "statement": "Exact mission statement or core purpose from the content",
    "source": "hero|about|services|contact|general",
    "score": 0,
    "evidence": "Specific quotes and evidence from content",
    "insights": ["Specific insights about the WHY statement"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "how": {
    "methodology": "Exact methodology description from content",
    "framework": "Framework name if mentioned",
    "score": 0,
    "evidence": "Specific quotes and evidence from content",
    "insights": ["Specific insights about the HOW approach"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "what": {
    "offerings": ["List of exact offerings from content"],
    "categories": ["Service categories mentioned"],
    "score": 0,
    "evidence": "Specific quotes and evidence from content",
    "insights": ["Specific insights about the WHAT offerings"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "who": {
    "testimonials": [
      {
        "client": "Client name from content",
        "company": "Company name from content",
        "title": "Job title from content",
        "quote": "Exact testimonial text from content",
        "results": "Success metrics mentioned"
      }
    ],
    "targetAudience": "Description of target audience from content",
    "score": 0,
    "evidence": "Specific quotes and evidence from content",
    "insights": ["Specific insights about the WHO testimonials"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "overallScore": 0,
  "summary": "Comprehensive summary of Golden Circle analysis",
  "strengths": ["List of key strengths identified"],
  "weaknesses": ["List of key weaknesses identified"],
  "priorityActions": [
    {
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "impact": "Expected impact on business"
    }
  ]
}

**CRITICAL:** Base all analysis on the ACTUAL CONTENT provided. Extract specific details, quotes, names, and examples. Use 0 score when elements are not present.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: text
      }, { status: 500 });
    }

    console.log(`✅ Golden Circle analysis completed for: ${_url}`);

    return NextResponse.json({
      success: true,
      _url,
      assessment: 'Golden Circle',
      data: analysisResult,
      message: 'Golden Circle analysis completed successfully'
    });

  } catch (error) {
    console.error('Golden Circle analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Golden Circle analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
