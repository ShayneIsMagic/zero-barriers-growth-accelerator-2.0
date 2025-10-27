import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes for complete Phase 3

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, phase1Data, phase2Data } = body;

    if (!url || !phase1Data || !phase2Data) {
      return NextResponse.json({
        success: false,
        error: 'URL, Phase 1 data, and Phase 2 data are required'
      }, { status: 400 });
    }

    console.log(`🎯 Starting Complete Phase 3 analysis for: ${url}`);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Generate comprehensive research and recommendations
    const comprehensiveAnalysis = await generateComprehensiveAnalysis(model, url, phase1Data, phase2Data);

    const phase3Result = {
      url,
      timestamp: new Date().toISOString(),
      comprehensiveAnalysis,
      summary: {
        totalRecommendations: comprehensiveAnalysis.recommendations?.length || 0,
        quickWins: comprehensiveAnalysis.quickWins?.length || 0,
        longTermStrategy: comprehensiveAnalysis.longTermStrategy?.length || 0,
        impactAnalysis: comprehensiveAnalysis.impactAnalysis?.length || 0,
        priorityActions: comprehensiveAnalysis.priorityActions?.length || 0
      }
    };

    console.log(`✅ Complete Phase 3 analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url,
      phase: 3,
      data: phase3Result,
      message: 'Complete Phase 3 analysis completed successfully'
    });

  } catch (error) {
    console.error('Complete Phase 3 analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Complete Phase 3 analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Comprehensive Analysis Generation
async function generateComprehensiveAnalysis(model: any, url: string, phase1Data: any, phase2Data: any) {
  const prompt = `
# COMPREHENSIVE RESEARCH & STRATEGY ANALYSIS

Analyze all Phase 1 and Phase 2 data to provide comprehensive research, recommendations, and strategic insights.

**URL:** ${url}

**Phase 1 Data (Content Collection & Google Tools):**
${JSON.stringify(phase1Data, null, 2)}

**Phase 2 Data (Framework Analysis):**
${JSON.stringify(phase2Data, null, 2)}

## ANALYSIS REQUIREMENTS

### 1. WHAT IS WORKING
- Identify strengths from all analyses
- Highlight successful elements
- Note high-performing areas
- Extract best practices

### 2. WHAT IS NOT WORKING
- Identify weaknesses and gaps
- Highlight problematic areas
- Note missing elements
- Extract improvement opportunities

### 3. RECOMMENDED CHANGES
- Specific, actionable recommendations
- Prioritized by impact and effort
- Based on evidence from all phases
- Include implementation guidance

### 4. IMPACT ANALYSIS
- Side-by-side comparison of current vs. proposed
- Quantified impact estimates
- Risk assessment
- Expected outcomes

### 5. QUICK WINS
- High-impact, low-effort improvements
- Immediate implementation opportunities
- Fast results potential
- Resource requirements

### 6. LONG-TERM STRATEGY
- Strategic roadmap for 6-12 months
- Major transformation opportunities
- Resource-intensive improvements
- Long-term vision alignment

## SCORING CRITERIA
- Impact: 1-10 (1 = minimal, 10 = transformational)
- Effort: 1-10 (1 = easy, 10 = complex)
- Priority: high|medium|low
- Timeline: immediate|short-term|medium-term|long-term

## REQUIRED OUTPUT FORMAT
Return a JSON object with this exact structure:

{
  "executiveSummary": {
    "overallAssessment": "Comprehensive assessment of the website's current state",
    "keyStrengths": ["List of top 5 strengths"],
    "criticalGaps": ["List of top 5 critical gaps"],
    "strategicPriorities": ["List of top 3 strategic priorities"],
    "expectedImpact": "Expected overall impact of implementing recommendations"
  },
  "whatIsWorking": {
    "contentStrengths": [
      {
        "area": "Content area name",
        "strength": "Specific strength description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on user experience",
        "recommendation": "How to leverage this strength"
      }
    ],
    "technicalStrengths": [
      {
        "area": "Technical area name",
        "strength": "Specific strength description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on performance",
        "recommendation": "How to leverage this strength"
      }
    ],
    "seoStrengths": [
      {
        "area": "SEO area name",
        "strength": "Specific strength description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on search visibility",
        "recommendation": "How to leverage this strength"
      }
    ],
    "frameworkStrengths": [
      {
        "framework": "Framework name",
        "strength": "Specific strength description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on user engagement",
        "recommendation": "How to leverage this strength"
      }
    ]
  },
  "whatIsNotWorking": {
    "contentGaps": [
      {
        "area": "Content area name",
        "gap": "Specific gap description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on user experience",
        "severity": "high|medium|low"
      }
    ],
    "technicalIssues": [
      {
        "area": "Technical area name",
        "issue": "Specific issue description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on performance",
        "severity": "high|medium|low"
      }
    ],
    "seoIssues": [
      {
        "area": "SEO area name",
        "issue": "Specific issue description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on search visibility",
        "severity": "high|medium|low"
      }
    ],
    "frameworkGaps": [
      {
        "framework": "Framework name",
        "gap": "Specific gap description",
        "evidence": "Evidence from analysis",
        "impact": "Impact on user engagement",
        "severity": "high|medium|low"
      }
    ]
  },
  "recommendedChanges": [
    {
      "id": "rec_001",
      "title": "Specific recommendation title",
      "description": "Detailed description of the change",
      "category": "content|technical|seo|framework|design|ux",
      "priority": "high|medium|low",
      "effort": 1,
      "impact": 1,
      "timeline": "immediate|short-term|medium-term|long-term",
      "resources": ["List of required resources"],
      "implementation": "Step-by-step implementation guide",
      "successMetrics": ["How to measure success"],
      "dependencies": ["Other recommendations this depends on"],
      "risks": ["Potential risks and mitigation strategies"]
    }
  ],
  "impactAnalysis": [
    {
      "change": "Change description",
      "currentState": "Current performance/score",
      "proposedState": "Expected performance/score after change",
      "improvement": "Quantified improvement",
      "confidence": "high|medium|low",
      "assumptions": ["Assumptions made in the analysis"],
      "measurement": "How to measure the impact"
    }
  ],
  "quickWins": [
    {
      "title": "Quick win title",
      "description": "Description of the quick win",
      "effort": 1,
      "impact": 1,
      "timeline": "1-2 weeks",
      "resources": ["Required resources"],
      "implementation": "Implementation steps",
      "expectedResults": "Expected results",
      "successMetrics": ["Success metrics"]
    }
  ],
  "longTermStrategy": [
    {
      "phase": "Phase name (e.g., Foundation, Growth, Optimization)",
      "timeline": "3-6 months",
      "objectives": ["List of objectives"],
      "initiatives": [
        {
          "title": "Initiative title",
          "description": "Initiative description",
          "effort": 1,
          "impact": 1,
          "dependencies": ["Dependencies"],
          "successCriteria": ["Success criteria"]
        }
      ],
      "resources": ["Required resources"],
      "risks": ["Potential risks"],
      "successMetrics": ["Success metrics"]
    }
  ],
  "priorityActions": [
    {
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "timeline": "When to implement",
      "owner": "Who should implement",
      "impact": "Expected impact",
      "effort": "Required effort",
      "dependencies": ["Dependencies"],
      "successMetrics": ["Success metrics"]
    }
  ],
  "implementationRoadmap": {
    "immediate": ["Actions for next 2 weeks"],
    "shortTerm": ["Actions for next month"],
    "mediumTerm": ["Actions for next 3 months"],
    "longTerm": ["Actions for next 6-12 months"]
  },
  "successMetrics": {
    "contentMetrics": ["Content-related success metrics"],
    "technicalMetrics": ["Technical success metrics"],
    "seoMetrics": ["SEO success metrics"],
    "engagementMetrics": ["User engagement metrics"],
    "conversionMetrics": ["Conversion metrics"]
  },
  "riskAssessment": {
    "highRisks": [
      {
        "risk": "Risk description",
        "impact": "Potential impact",
        "probability": "high|medium|low",
        "mitigation": "Mitigation strategies"
      }
    ],
    "mediumRisks": [
      {
        "risk": "Risk description",
        "impact": "Potential impact",
        "probability": "high|medium|low",
        "mitigation": "Mitigation strategies"
      }
    ],
    "lowRisks": [
      {
        "risk": "Risk description",
        "impact": "Potential impact",
        "probability": "high|medium|low",
        "mitigation": "Mitigation strategies"
      }
    ]
  },
  "resourceRequirements": {
    "humanResources": ["Required team members/skills"],
    "technicalResources": ["Required technical resources"],
    "financialResources": ["Budget requirements"],
    "timeResources": ["Time requirements"],
    "externalResources": ["External services/consultants needed"]
  },
  "nextSteps": [
    {
      "step": "Specific next step",
      "timeline": "When to complete",
      "owner": "Who should complete",
      "dependencies": ["Dependencies"],
      "successCriteria": ["Success criteria"]
    }
  ]
}

**CRITICAL:** Base all analysis on the ACTUAL DATA provided from Phase 1 and Phase 2. Extract specific insights, evidence, and recommendations. Provide actionable, prioritized guidance with clear implementation steps.
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
    console.error('Failed to parse Phase 3 response:', parseError);
    return { error: 'Failed to parse Phase 3 response', rawResponse: text };
  }
}
