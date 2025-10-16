import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 300; // 5 minutes for complete Phase 2

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content, phase1Data } = body;

    if (!url || !content) {
      return NextResponse.json({
        success: false,
        error: 'URL and content are required'
      }, { status: 400 });
    }

    console.log(`🎯 Starting Complete Phase 2 analysis for: ${url}`);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Run all framework analyses in parallel
    const [goldenCircleResult, elementsOfValueResult, b2bElementsResult, cliftonStrengthsResult, contentComparisonResult] = await Promise.allSettled([
      runGoldenCircleAnalysis(model, url, content, phase1Data),
      runElementsOfValueAnalysis(model, url, content, phase1Data),
      runB2BElementsAnalysis(model, url, content, phase1Data),
      runCliftonStrengthsAnalysis(model, url, content, phase1Data),
      runContentComparisonAnalysis(model, url, content, phase1Data)
    ]);

    const phase2Result = {
      url,
      timestamp: new Date().toISOString(),
      goldenCircle: goldenCircleResult.status === 'fulfilled' ? goldenCircleResult.value : { error: 'Golden Circle analysis failed' },
      elementsOfValue: elementsOfValueResult.status === 'fulfilled' ? elementsOfValueResult.value : { error: 'Elements of Value analysis failed' },
      b2bElements: b2bElementsResult.status === 'fulfilled' ? b2bElementsResult.value : { error: 'B2B Elements analysis failed' },
      cliftonStrengths: cliftonStrengthsResult.status === 'fulfilled' ? cliftonStrengthsResult.value : { error: 'CliftonStrengths analysis failed' },
      contentComparison: contentComparisonResult.status === 'fulfilled' ? contentComparisonResult.value : { error: 'Content Comparison analysis failed' },
      summary: {
        completedAnalyses: [
          goldenCircleResult.status === 'fulfilled' ? 'Golden Circle' : null,
          elementsOfValueResult.status === 'fulfilled' ? 'Elements of Value' : null,
          b2bElementsResult.status === 'fulfilled' ? 'B2B Elements' : null,
          cliftonStrengthsResult.status === 'fulfilled' ? 'CliftonStrengths' : null,
          contentComparisonResult.status === 'fulfilled' ? 'Content Comparison' : null
        ].filter(Boolean),
        failedAnalyses: [
          goldenCircleResult.status === 'rejected' ? 'Golden Circle' : null,
          elementsOfValueResult.status === 'rejected' ? 'Elements of Value' : null,
          b2bElementsResult.status === 'rejected' ? 'B2B Elements' : null,
          cliftonStrengthsResult.status === 'rejected' ? 'CliftonStrengths' : null,
          contentComparisonResult.status === 'rejected' ? 'Content Comparison' : null
        ].filter(Boolean)
      }
    };

    console.log(`✅ Complete Phase 2 analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url,
      phase: 2,
      data: phase2Result,
      message: 'Complete Phase 2 analysis completed successfully'
    });

  } catch (error) {
    console.error('Complete Phase 2 analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Complete Phase 2 analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Golden Circle Analysis
async function runGoldenCircleAnalysis(model: any, url: string, content: any, phase1Data: any) {
  const prompt = `
# GOLDEN CIRCLE ANALYSIS (Simon Sinek)

Analyze the following website content using Simon Sinek's Golden Circle framework. Extract specific details and provide scores for each dimension.

**URL:** ${url}
**Content to Analyze:**
${JSON.stringify(content, null, 2)}

**Phase 1 Data Available:**
${phase1Data ? JSON.stringify(phase1Data, null, 2) : 'No Phase 1 data'}

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

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse Golden Circle response:', parseError);
    return { error: 'Failed to parse Golden Circle response', rawResponse: text };
  }
}

// Elements of Value Analysis
async function runElementsOfValueAnalysis(model: any, url: string, content: any, phase1Data: any) {
  const prompt = `
# ELEMENTS OF VALUE ANALYSIS (Bain & Company)

Analyze the following website content using Bain & Company's Elements of Value framework. Score each of the 30 elements based on evidence in the content.

**URL:** ${url}
**Content to Analyze:**
${JSON.stringify(content, null, 2)}

**Phase 1 Data Available:**
${phase1Data ? JSON.stringify(phase1Data, null, 2) : 'No Phase 1 data'}

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

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse Elements of Value response:', parseError);
    return { error: 'Failed to parse Elements of Value response', rawResponse: text };
  }
}

// B2B Elements Analysis
async function runB2BElementsAnalysis(model: any, url: string, content: any, phase1Data: any) {
  const prompt = `
# B2B ELEMENTS OF VALUE ANALYSIS

Analyze the following website content using B2B Elements of Value framework. Score each of the 40 elements based on evidence in the content.

**URL:** ${url}
**Content to Analyze:**
${JSON.stringify(content, null, 2)}

**Phase 1 Data Available:**
${phase1Data ? JSON.stringify(phase1Data, null, 2) : 'No Phase 1 data'}

## ANALYSIS REQUIREMENTS

### TABLE STAKES (4 elements)
- meetingSpecifications: Does it meet basic requirements?
- acceptablePrice: Is pricing competitive?
- regulatoryCompliance: Does it meet regulatory standards?
- ethicalStandards: Does it maintain ethical practices?

### FUNCTIONAL (5 elements)
- improvedTopLine: Does it increase revenue?
- costReduction: Does it reduce costs?
- productQuality: Does it improve product quality?
- scalability: Does it scale effectively?
- innovation: Does it provide innovation?

### EASE OF DOING BUSINESS (19 elements)
- timeSavings: Does it save time?
- reducedEffort: Does it reduce effort?
- decreasedHassles: Does it eliminate hassles?
- information: Does it provide valuable information?
- transparency: Is it transparent?
- organization: Does it help organize?
- simplification: Does it simplify processes?
- connection: Does it connect systems?
- integration: Does it integrate well?
- availability: Is it readily available?
- variety: Does it offer variety?
- configurability: Is it configurable?
- responsiveness: Is it responsive?
- expertise: Does it provide expertise?
- commitment: Is there commitment?
- stability: Is it stable?
- culturalFit: Does it fit culturally?
- riskReduction: Does it reduce risk?
- reach: Does it extend reach?
- flexibility: Is it flexible?
- componentQuality: Are components high quality?

### INDIVIDUAL (7 elements)
- networkExpansion: Does it expand networks?
- marketability: Does it improve marketability?
- reputationalAssurance: Does it assure reputation?
- designAesthetics: Is design appealing?
- growthDevelopment: Does it promote growth?
- reducedAnxiety: Does it reduce anxiety?
- funPerks: Does it provide fun/perks?

### INSPIRATIONAL (4 elements)
- purpose: Does it provide purpose?
- vision: Does it provide vision?
- hope: Does it provide hope?
- socialResponsibility: Does it show social responsibility?

## SCORING CRITERIA
- 0: Not present or mentioned in content
- 1-3: Poor/Weak - Minimal evidence, vague mentions
- 4-6: Fair/Average - Some evidence, basic mentions
- 7-8: Good/Strong - Clear evidence, well-presented
- 9-10: Excellent/Outstanding - Exceptional evidence, compelling

## REQUIRED OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "tableStakes": {
    "meetingSpecifications": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "acceptablePrice": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "regulatoryCompliance": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "ethicalStandards": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "functional": {
    "improvedTopLine": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "costReduction": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "productQuality": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "scalability": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "innovation": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "easeOfDoingBusiness": {
    "timeSavings": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "reducedEffort": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "decreasedHassles": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "information": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "transparency": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "organization": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "simplification": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "connection": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "integration": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "availability": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "variety": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "configurability": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "responsiveness": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "expertise": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "commitment": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "stability": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "culturalFit": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "riskReduction": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "reach": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "flexibility": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "componentQuality": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "individual": {
    "networkExpansion": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "marketability": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "reputationalAssurance": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "designAesthetics": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "growthDevelopment": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "reducedAnxiety": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "funPerks": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "inspirational": {
    "purpose": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "vision": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "hope": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "socialResponsibility": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "overallScore": 0,
  "summary": "Comprehensive summary of B2B Elements analysis",
  "strengths": ["List of key strengths identified"],
  "weaknesses": ["List of key weaknesses identified"],
  "priorityActions": [
    {
      "element": "Element name",
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "impact": "Expected impact on business value"
    }
  ]
}

**CRITICAL:** Base all analysis on the ACTUAL CONTENT provided. Extract specific details, quotes, and examples. Use 0 score when elements are not present.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse B2B Elements response:', parseError);
    return { error: 'Failed to parse B2B Elements response', rawResponse: text };
  }
}

// CliftonStrengths Analysis
async function runCliftonStrengthsAnalysis(model: any, url: string, content: any, phase1Data: any) {
  const prompt = `
# CLIFTONSTRENGTHS ANALYSIS (Gallup)

Analyze the following website content using Gallup's CliftonStrengths framework. Score each of the 34 themes based on content appeal and language patterns.

**URL:** ${url}
**Content to Analyze:**
${JSON.stringify(content, null, 2)}

**Phase 1 Data Available:**
${phase1Data ? JSON.stringify(phase1Data, null, 2) : 'No Phase 1 data'}

## ANALYSIS REQUIREMENTS

### STRATEGIC THINKING (8 themes)
- Analytical: Does it appeal to analytical thinkers?
- Context: Does it provide historical context?
- Futuristic: Does it focus on future possibilities?
- Ideation: Does it present new ideas?
- Input: Does it gather and process information?
- Intellection: Does it appeal to intellectual thinking?
- Learner: Does it emphasize learning and growth?
- Strategic: Does it present strategic thinking?

### EXECUTING (9 themes)
- Achiever: Does it appeal to achievers?
- Arranger: Does it show organizational skills?
- Belief: Does it align with core beliefs?
- Consistency: Does it show consistency?
- Deliberative: Does it show careful consideration?
- Discipline: Does it show discipline?
- Focus: Does it show focus?
- Responsibility: Does it show responsibility?
- Restorative: Does it show problem-solving?

### INFLUENCING (8 themes)
- Activator: Does it inspire action?
- Command: Does it show leadership?
- Communication: Does it communicate effectively?
- Competition: Does it appeal to competitive nature?
- Maximizer: Does it maximize potential?
- Self-Assurance: Does it show confidence?
- Significance: Does it show importance?
- Woo: Does it win others over?

### RELATIONSHIP BUILDING (9 themes)
- Adaptability: Does it show adaptability?
- Connectedness: Does it show connections?
- Developer: Does it develop others?
- Empathy: Does it show empathy?
- Harmony: Does it promote harmony?
- Includer: Does it include others?
- Individualization: Does it individualize?
- Positivity: Does it show positivity?
- Relator: Does it build relationships?

## SCORING CRITERIA
- 0: Not present or mentioned in content
- 1-3: Poor/Weak - Minimal evidence, vague mentions
- 4-6: Fair/Average - Some evidence, basic mentions
- 7-8: Good/Strong - Clear evidence, well-presented
- 9-10: Excellent/Outstanding - Exceptional evidence, compelling

## REQUIRED OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "strategicThinking": {
    "analytical": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "context": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "futuristic": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "ideation": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "input": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "intellection": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "learner": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "strategic": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "topThemes": ["List of top 3 themes with scores"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "executing": {
    "achiever": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "arranger": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "belief": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "consistency": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "deliberative": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "discipline": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "focus": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "responsibility": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "restorative": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "topThemes": ["List of top 3 themes with scores"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "influencing": {
    "activator": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "command": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "communication": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "competition": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "maximizer": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "selfAssurance": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "significance": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "woo": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "topThemes": ["List of top 3 themes with scores"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "relationshipBuilding": {
    "adaptability": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "connectedness": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "developer": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "empathy": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "harmony": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "includer": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "individualization": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "positivity": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "relator": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "topThemes": ["List of top 3 themes with scores"],
    "recommendations": ["Specific recommendations for improvement"]
  },
  "overallScore": 0,
  "summary": "Comprehensive summary of CliftonStrengths analysis",
  "strengths": ["List of key strengths identified"],
  "weaknesses": ["List of key weaknesses identified"],
  "priorityActions": [
    {
      "theme": "Theme name",
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "impact": "Expected impact on audience engagement"
    }
  ]
}

**CRITICAL:** Base all analysis on the ACTUAL CONTENT provided. Extract specific details, quotes, and examples. Use 0 score when elements are not present.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse CliftonStrengths response:', parseError);
    return { error: 'Failed to parse CliftonStrengths response', rawResponse: text };
  }
}

// Content Comparison Analysis
async function runContentComparisonAnalysis(model: any, url: string, content: any, phase1Data: any) {
  const prompt = `
# CONTENT COMPARISON ANALYSIS

Analyze the following website content and compare it against best practices and competitor standards.

**URL:** ${url}
**Content to Analyze:**
${JSON.stringify(content, null, 2)}

**Phase 1 Data Available:**
${phase1Data ? JSON.stringify(phase1Data, null, 2) : 'No Phase 1 data'}

## ANALYSIS REQUIREMENTS

### CONTENT QUALITY COMPARISON
- Clarity: How clear is the messaging?
- Completeness: How complete is the information?
- Credibility: How credible does it appear?
- Engagement: How engaging is the content?
- Uniqueness: How unique is the positioning?

### COMPETITIVE POSITIONING
- Differentiation: How well does it differentiate?
- Value Proposition: How clear is the value prop?
- Target Audience: How well defined is the audience?
- Call to Action: How effective are the CTAs?

### CONTENT STRUCTURE
- Headlines: How effective are the headlines?
- Subheadings: How well organized are subheadings?
- Body Content: How well written is the body?
- Visual Elements: How well integrated are visuals?

## SCORING CRITERIA
- 0: Not present or mentioned in content
- 1-3: Poor/Weak - Major improvements needed
- 4-6: Fair/Average - Some strengths, room for improvement
- 7-8: Good/Strong - Well-executed with minor gaps
- 9-10: Excellent/Outstanding - Best practice, highly effective

## REQUIRED OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "contentQuality": {
    "clarity": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "completeness": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "credibility": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "engagement": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "uniqueness": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "competitivePositioning": {
    "differentiation": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "valueProposition": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "targetAudience": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "callToAction": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "contentStructure": {
    "headlines": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "subheadings": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "bodyContent": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "visualElements": { "score": 0, "evidence": "Quote from content", "insights": ["Specific insights"] },
    "overallScore": 0,
    "recommendations": ["Specific recommendations for improvement"]
  },
  "overallScore": 0,
  "summary": "Comprehensive summary of Content Comparison analysis",
  "strengths": ["List of key strengths identified"],
  "weaknesses": ["List of key weaknesses identified"],
  "priorityActions": [
    {
      "area": "Area name",
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "impact": "Expected impact on content effectiveness"
    }
  ]
}

**CRITICAL:** Base all analysis on the ACTUAL CONTENT provided. Extract specific details, quotes, and examples. Use 0 score when elements are not present.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse Content Comparison response:', parseError);
    return { error: 'Failed to parse Content Comparison response', rawResponse: text };
  }
}
