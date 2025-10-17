import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes for comprehensive analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content } = body;

    if (!url || !content) {
      return NextResponse.json({
        success: false,
        error: 'URL and content are required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting comprehensive analysis for: ${url}`);

    // Run all assessments in parallel
    const [goldenCircleResult, elementsOfValueResult, cliftonStrengthsResult, b2bElementsResult] = await Promise.allSettled([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze/golden-circle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, content })
      }).then(res => res.json()),
      
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze/elements-of-value`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, content })
      }).then(res => res.json()),
      
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze/clifton-strengths`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, content })
      }).then(res => res.json()),
      
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze/b2b-elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, content })
      }).then(res => res.json())
    ]);

    // Process results
    const assessments = {
      goldenCircle: goldenCircleResult.status === 'fulfilled' ? goldenCircleResult.value : null,
      elementsOfValue: elementsOfValueResult.status === 'fulfilled' ? elementsOfValueResult.value : null,
      cliftonStrengths: cliftonStrengthsResult.status === 'fulfilled' ? cliftonStrengthsResult.value : null,
      b2bElements: b2bElementsResult.status === 'fulfilled' ? b2bElementsResult.value : null
    };

    // Calculate overall scores
    const scores = [];
    if (assessments.goldenCircle?.success) scores.push(assessments.goldenCircle.data.overallScore);
    if (assessments.elementsOfValue?.success) scores.push(assessments.elementsOfValue.data.overallScore);
    if (assessments.cliftonStrengths?.success) scores.push(assessments.cliftonStrengths.data.overallScore);
    if (assessments.b2bElements?.success) scores.push(assessments.b2bElements.data.overallScore);

    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Generate comprehensive insights
    const comprehensiveInsights = generateComprehensiveInsights(assessments, overallScore);

    const comprehensiveReport = {
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      assessments,
      insights: comprehensiveInsights,
      summary: {
        totalAssessments: Object.values(assessments).filter(a => a?.success).length,
        completedAssessments: Object.values(assessments).filter(a => a?.success).map(a => a.assessment),
        failedAssessments: Object.values(assessments).filter(a => !a?.success).map(a => a?.error || 'Unknown error'),
        averageScore: overallScore,
        grade: getGrade(overallScore)
      }
    };

    console.log(`✅ Comprehensive analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url,
      data: comprehensiveReport,
      message: 'Comprehensive analysis completed successfully'
    });

  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Comprehensive analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

interface AssessmentData {
  goldenCircle?: { 
    success?: boolean;
    data?: {
      strengths?: string[];
      weaknesses?: string[];
      priorityActions?: string[];
      [key: string]: unknown;
    };
    overallScore?: number;
    [key: string]: unknown;
  };
  elementsOfValue?: { 
    success?: boolean;
    data?: {
      strengths?: string[];
      weaknesses?: string[];
      priorityActions?: string[];
      [key: string]: unknown;
    };
    overallScore?: number;
    [key: string]: unknown;
  };
  cliftonStrengths?: { 
    success?: boolean;
    data?: {
      strengths?: string[];
      weaknesses?: string[];
      priorityActions?: string[];
      [key: string]: unknown;
    };
    overallScore?: number;
    [key: string]: unknown;
  };
  b2bElements?: { 
    success?: boolean;
    data?: {
      strengths?: string[];
      weaknesses?: string[];
      priorityActions?: string[];
      [key: string]: unknown;
    };
    overallScore?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function generateComprehensiveInsights(assessments: AssessmentData, overallScore: number) {
  const insights = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    recommendations: [],
    priorityActions: []
  };

  // Analyze Golden Circle
  if (assessments.goldenCircle?.success) {
    const gc = assessments.goldenCircle.data;
    if (gc.strengths) insights.strengths.push(...gc.strengths);
    if (gc.weaknesses) insights.weaknesses.push(...gc.weaknesses);
    if (gc.priorityActions) insights.priorityActions.push(...gc.priorityActions);
  }

  // Analyze Elements of Value
  if (assessments.elementsOfValue?.success) {
    const eov = assessments.elementsOfValue.data;
    if (eov.strengths) insights.strengths.push(...eov.strengths);
    if (eov.weaknesses) insights.weaknesses.push(...eov.weaknesses);
  }

  // Analyze CliftonStrengths
  if (assessments.cliftonStrengths?.success) {
    const cs = assessments.cliftonStrengths.data;
    if (cs.strengths) insights.strengths.push(...cs.strengths);
    if (cs.weaknesses) insights.weaknesses.push(...cs.weaknesses);
  }

  // Analyze B2B Elements
  if (assessments.b2bElements?.success) {
    const b2b = assessments.b2bElements.data;
    if (b2b.strengths) insights.strengths.push(...b2b.strengths);
    if (b2b.weaknesses) insights.weaknesses.push(...b2b.weaknesses);
  }

  // Generate cross-framework insights
  if (overallScore < 5) {
    insights.opportunities.push('Significant improvement potential across all frameworks');
    insights.recommendations.push('Focus on foundational messaging and value proposition clarity');
  } else if (overallScore < 7) {
    insights.opportunities.push('Good foundation with room for strategic enhancement');
    insights.recommendations.push('Strengthen specific weak areas identified in individual assessments');
  } else {
    insights.strengths.push('Strong performance across multiple frameworks');
    insights.recommendations.push('Maintain current strengths while addressing remaining gaps');
  }

  return insights;
}

function getGrade(score: number): string {
  if (score >= 9) return 'A+';
  if (score >= 8) return 'A';
  if (score >= 7) return 'B+';
  if (score >= 6) return 'B';
  if (score >= 5) return 'C+';
  if (score >= 4) return 'C';
  if (score >= 3) return 'D';
  return 'F';
}
