import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { _url, content } = body;

    if (!_url || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL and content are required',
        },
        { status: 400 }
      );
    }

    console.log(`🎯 Starting Elements of Value analysis for: ${_url}`);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY not configured',
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
# ELEMENTS OF VALUE ANALYSIS (Bain & Company)

Analyze the following website content using Bain & Company's Elements of Value framework. Score each of the 30 elements based on evidence in the content.

**URL:** ${_url}
**Content to Analyze:**
${JSON.stringify(content, null, 2)}

## ANALYSIS REQUIREMENTS

### FUNCTIONAL ELEMENTS (14 elements)
Score each element 0-10 based on evidence in content:
- savesTime: Does the content mention time-saving benefits?
- simplifies: Does it make things easier or simpler?
- makesMoney: Does it help customers make or save money?
- reducesRisk: Does it reduce risk or uncertainty?
- organizes: Does it help organize or structure things?
- integrates: Does it integrate with other systems/tools?
- connects: Does it connect people or systems?
- reducesEffort: Does it reduce effort or work required?
- avoidsHassle: Does it eliminate hassles or problems?
- quality: Does it emphasize quality or excellence?
- variety: Does it offer variety or options?
- sensoryAppeal: Does it appeal to the senses?
- informs: Does it provide valuable information?
- badge: Does it provide status or recognition?

### EMOTIONAL ELEMENTS (10 elements)
Score each element 0-10 based on evidence in content:
- reducesAnxiety: Does it reduce worry or stress?
- rewards: Does it provide rewards or incentives?
- nostalgia: Does it evoke positive memories?
- designAesthetics: Does it emphasize beautiful design?
- funEntertainment: Does it provide fun or entertainment?
- attractiveness: Does it make users more attractive?
- wellness: Does it promote health or wellness?
- belonging: Does it create sense of belonging?
- providesAccess: Does it provide exclusive access?
- selfActualization: Does it help users reach potential?

### LIFE-CHANGING ELEMENTS (5 elements)
Score each element 0-10 based on evidence in content:
- providesHope: Does it provide hope or optimism?
- selfActualization: Does it help users reach potential?
- motivation: Does it motivate or inspire?
- heirloom: Does it create lasting value?
- affiliationBelonging: Does it create community?

### SOCIAL IMPACT ELEMENTS (1 element)
Score each element 0-10 based on evidence in content:
- selfTranscendence: Does it help users transcend themselves?

## SCORING CRITERIA
- 0: Not present or mentioned in content
- 1-3: Poor/Weak - Minimal evidence, vague mentions
- 4-6: Fair/Average - Some evidence, basic mentions
- 7-8: Good/Strong - Clear evidence, well-presented
- 9-10: Excellent/Outstanding - Exceptional evidence, compelling

## REQUIRED OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "functional": {
    "savesTime": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "simplifies": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "makesMoney": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "reducesRisk": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "organizes": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "integrates": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "connects": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "reducesEffort": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "avoidsHassle": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "quality": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "variety": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "sensoryAppeal": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "informs": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "badge": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "topElements": ["List of top 5 elements with scores"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "emotional": {
    "reducesAnxiety": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "rewards": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "nostalgia": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "designAesthetics": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "funEntertainment": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "attractiveness": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "wellness": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "belonging": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "providesAccess": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "selfActualization": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "topElements": ["List of top 5 elements with scores"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "lifeChanging": {
    "providesHope": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "selfActualization": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "motivation": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "heirloom": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "affiliationBelonging": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "topElements": ["List of top 3 elements with scores"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "socialImpact": {
    "selfTranscendence": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "overallScore": 0,
  "summary": "Comprehensive summary of Elements of Value analysis",
  "strengths": ["List of key strengths identified"],
  "weaknesses": ["List of key weaknesses identified"],
  "priorityActions": [
    {
      "element": "Element name",
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "impact": "Expected impact on customer value"
    }
  ]
}

**CRITICAL:** Base all analysis on the ACTUAL CONTENT provided. Extract specific details, quotes, and examples. Use 0 score when elements are not present.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let analysisResult;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response',
          rawResponse: text,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Elements of Value analysis completed for: ${_url}`);

    return NextResponse.json({
      success: true,
      _url,
      assessment: 'Elements of Value',
      data: analysisResult,
      message: 'Elements of Value analysis completed successfully',
    });
  } catch (error) {
    console.error('Elements of Value analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Elements of Value analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
