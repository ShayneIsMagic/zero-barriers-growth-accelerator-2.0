import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Step validation schemas
const stepSchemas = {
  'base-analysis': z.object({
    url: z.string().url('Invalid URL format'),
    analysisType: z.enum(['full', 'golden-circle', 'elements-of-value', 'b2b-elements', 'clifton-strengths']).default('full'),
  }),
  'pageaudit': z.object({
    url: z.string().url('Invalid URL format'),
    keyword: z.string().optional(),
  }),
  'lighthouse': z.object({
    url: z.string().url('Invalid URL format'),
    includeAllPages: z.boolean().default(false),
  }),
  'gemini-insights': z.object({
    baseAnalysis: z.any(),
    pageAuditData: z.any().optional(),
    lighthouseData: z.any().optional(),
    allPagesLighthouse: z.array(z.any()).optional(),
  }),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, data } = body;

    if (!step || !data) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'Step and data parameters are required',
      }, { status: 400 });
    }

    // Validate step data
    if (!stepSchemas[step as keyof typeof stepSchemas]) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_STEP',
        message: `Invalid step: ${step}. Valid steps are: ${Object.keys(stepSchemas).join(', ')}`,
      }, { status: 400 });
    }

    const schema = stepSchemas[step as keyof typeof stepSchemas];
    const validatedData = schema.parse(data);

    let result;
    let error = null;

    try {
      switch (step) {
        case 'base-analysis':
          result = await executeBaseAnalysis(validatedData);
          break;
        case 'pageaudit':
          result = await executePageAuditAnalysis(validatedData);
          break;
        case 'lighthouse':
          result = await executeLighthouseAnalysis(validatedData);
          break;
        case 'gemini-insights':
          result = await executeGeminiInsights(validatedData);
          break;
        default:
          throw new Error(`Unknown step: ${step}`);
      }
    } catch (stepError) {
      error = {
        message: stepError instanceof Error ? stepError.message : 'Unknown error',
        details: stepError instanceof Error ? stepError.stack : 'No details available',
        timestamp: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: error === null,
      step,
      data: result,
      error,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Step-by-step analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'STEP_EXECUTION_FAILED',
      message: error instanceof Error ? error.message : 'Step execution failed',
      details: {
        type: 'validation_error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.stack : 'Unknown error'
      }
    }, { status: 500 });
  }
}

/**
 * Execute base AI analysis (Golden Circle, Elements of Value, CliftonStrengths)
 */
async function executeBaseAnalysis(data: any) {
  const { performRealAnalysis } = await import('@/lib/free-ai-analysis');
  
  console.log(`Step 1: Running base AI analysis for ${data.url}...`);
  const result = await performRealAnalysis(data.url, data.analysisType);
  
  console.log(`Base analysis completed with overall score: ${result.overallScore}`);
  return {
    type: 'base-analysis',
    url: data.url,
    analysisType: data.analysisType,
    result,
    status: 'completed',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Execute PageAudit analysis
 */
async function executePageAuditAnalysis(data: any) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const path = await import('path');
  
  const execAsync = promisify(exec);
  
  try {
    console.log(`Step 2: Running PageAudit analysis for ${data.url}...`);
    const scriptPath = path.join(process.cwd(), 'scripts', 'pageaudit-analysis.js');
    const keywordArg = data.keyword ? `"${data.keyword}"` : '';
    const command = `node "${scriptPath}" "${data.url}" ${keywordArg}`;
    
    console.log(`PageAudit command: ${command}`);
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minutes timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    if (stderr) {
      console.warn('PageAudit stderr:', stderr);
    }

    // Extract JSON from stdout
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      console.log(`PageAudit analysis completed with overall score: ${result.scores?.overall || 'unknown'}`);
      return {
        type: 'pageaudit',
        url: data.url,
        keyword: data.keyword,
        result,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Could not parse PageAudit results from stdout');
  } catch (error) {
    console.error('PageAudit analysis failed:', error);
    return {
      type: 'pageaudit',
      url: data.url,
      keyword: data.keyword,
      result: null,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Execute Lighthouse analysis
 */
async function executeLighthouseAnalysis(data: any) {
  try {
    console.log(`Step 3: Running Lighthouse analysis for ${data.url}...`);
    
    const { runLighthouseAnalysis } = await import('@/lib/lighthouse-service');
    const result = await runLighthouseAnalysis(data.url);
    
    console.log(`Lighthouse analysis completed with overall score: ${result.scores?.overall || 'unknown'}`);
    return {
      type: 'lighthouse',
      url: data.url,
      includeAllPages: data.includeAllPages,
      result,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Lighthouse analysis failed:', error);
    return {
      type: 'lighthouse',
      url: data.url,
      includeAllPages: data.includeAllPages,
      result: null,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Execute Gemini insights generation
 */
async function executeGeminiInsights(data: any) {
  try {
    console.log('Step 4: Generating Gemini insights...');
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
You are an expert business strategist analyzing comprehensive website audit data. Provide strategic insights based on:

## BASE ANALYSIS:
${JSON.stringify(data.baseAnalysis, null, 2)}

## PAGEAUDIT ANALYSIS:
${JSON.stringify(data.pageAuditData, null, 2)}

## LIGHTHOUSE ANALYSIS:
${JSON.stringify(data.lighthouseData, null, 2)}

## ALL PAGES LIGHTHOUSE:
${JSON.stringify(data.allPagesLighthouse, null, 2)}

Provide a comprehensive strategic analysis in this EXACT JSON format:

{
  "executiveSummary": "Comprehensive 3-paragraph executive summary highlighting the most critical findings and strategic implications",
  "keyStrengths": [
    "Strength 1 with specific evidence",
    "Strength 2 with specific evidence",
    "Strength 3 with specific evidence"
  ],
  "criticalWeaknesses": [
    "Weakness 1 with specific impact",
    "Weakness 2 with specific impact", 
    "Weakness 3 with specific impact"
  ],
  "competitiveAdvantages": [
    "Advantage 1 with competitive context",
    "Advantage 2 with competitive context",
    "Advantage 3 with competitive context"
  ],
  "transformationOpportunities": [
    "Opportunity 1 with potential impact",
    "Opportunity 2 with potential impact",
    "Opportunity 3 with potential impact"
  ],
  "implementationRoadmap": {
    "immediate": [
      "Week 1-2 action item with specific deliverables",
      "Week 1-2 action item with specific deliverables",
      "Week 1-2 action item with specific deliverables"
    ],
    "shortTerm": [
      "Month 1-3 action item with measurable outcomes",
      "Month 1-3 action item with measurable outcomes",
      "Month 1-3 action item with measurable outcomes"
    ],
    "longTerm": [
      "Month 4-12 strategic initiative with transformation goals",
      "Month 4-12 strategic initiative with transformation goals",
      "Month 4-12 strategic initiative with transformation goals"
    ]
  },
  "successMetrics": {
    "current": [
      "Current metric 1 with baseline value",
      "Current metric 2 with baseline value",
      "Current metric 3 with baseline value"
    ],
    "target": [
      "Target metric 1 with specific goal",
      "Target metric 2 with specific goal", 
      "Target metric 3 with specific goal"
    ],
    "measurement": [
      "How to measure metric 1 with tools/methods",
      "How to measure metric 2 with tools/methods",
      "How to measure metric 3 with tools/methods"
    ]
  }
}

Output ONLY valid JSON, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Try to find JSON object in the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      console.log('Gemini insights generated successfully');
      return {
        type: 'gemini-insights',
        result: insights,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Could not parse Gemini response as JSON');
  } catch (error) {
    console.error('Gemini insights generation failed:', error);
    return {
      type: 'gemini-insights',
      result: {
        executiveSummary: 'AI insights generation failed. Please check API configuration.',
        keyStrengths: ['Analysis incomplete'],
        criticalWeaknesses: ['AI service unavailable'],
        competitiveAdvantages: ['Manual review required'],
        transformationOpportunities: ['Setup AI services for deeper insights'],
        implementationRoadmap: {
          immediate: ['Configure AI API keys'],
          shortTerm: ['Re-run comprehensive analysis'],
          longTerm: ['Implement AI-powered insights']
        },
        successMetrics: {
          current: ['Baseline metrics unavailable'],
          target: ['Target metrics to be defined'],
          measurement: ['Measurement methods to be established']
        }
      },
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
