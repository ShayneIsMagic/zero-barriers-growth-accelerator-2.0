import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { _WebsiteAnalysisResult, LighthouseAnalysis } from '@/types/analysis';
import { performRealAnalysis } from '@/lib/free-ai-analysis';
import { runLighthouseAnalysis } from '@/lib/lighthouse-service';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Request validation schema
const comprehensiveAnalysisSchema = z.object({
  url: z.string().url('Invalid URL format'),
  keyword: z.string().optional(),
  includePageAudit: z.boolean().default(true),
  includeLighthouse: z.boolean().default(true),
  includeAllPages: z.boolean().default(false),
});

// Enhanced analysis result interface
interface PageAuditAnalysis {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  [key: string]: unknown;
}

// Using imported LighthouseAnalysis from types/analysis

interface ComprehensiveAnalysisResult extends WebsiteAnalysisResult {
  pageAuditAnalysis?: PageAuditAnalysis;
  lighthouseAnalysis?: LighthouseAnalysis;
  allPagesLighthouse?: LighthouseAnalysis[];
  geminiInsights?: {
    executiveSummary: string;
    keyStrengths: string[];
    criticalWeaknesses: string[];
    competitiveAdvantages: string[];
    transformationOpportunities: string[];
    implementationRoadmap: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    successMetrics: {
      current: string[];
      target: string[];
      measurement: string[];
    };
  };
}

/**
 * Run PageAudit analysis using our script
 */
async function runPageAuditAnalysis(url: string, keyword?: string): Promise<PageAuditAnalysis | null> {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'pageaudit-analysis.js');
    const keywordArg = keyword ? `"${keyword}"` : '';
    const command = `node "${scriptPath}" "${url}" ${keywordArg}`;
    
    console.log(`Running PageAudit analysis: ${command}`);
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
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not parse PageAudit results');
  } catch (error) {
    console.error('PageAudit analysis failed:', error);
    return null;
  }
}

/**
 * Run Lighthouse analysis on all pages
 */
async function runLighthouseAllPages(url: string): Promise<LighthouseAnalysis[]> {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'lighthouse-per-page.js');
    const command = `node "${scriptPath}" "${url}" --discover`;
    
    console.log(`Running Lighthouse all pages analysis: ${command}`);
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minutes timeout
      maxBuffer: 1024 * 1024 * 20 // 20MB buffer
    });

    if (stderr) {
      console.warn('Lighthouse stderr:', stderr);
    }

    // Extract JSON from stdout
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result.pageResults || [];
    }

    return [];
  } catch (error) {
    console.error('Lighthouse all pages analysis failed:', error);
    return [];
  }
}

/**
 * Generate comprehensive Gemini insights
 */
async function generateGeminiInsights(
  baseAnalysis: WebsiteAnalysisResult,
  pageAuditData: PageAuditAnalysis | null,
  lighthouseData: LighthouseAnalysis | null,
  allPagesLighthouse: LighthouseAnalysis[]
): Promise<ComprehensiveAnalysisResult['geminiInsights']> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
You are an expert business strategist and growth consultant analyzing a comprehensive website audit. Provide strategic insights based on the following data:

## BASE ANALYSIS RESULTS:
${JSON.stringify(baseAnalysis, null, 2)}

## PAGEAUDIT ANALYSIS:
${JSON.stringify(pageAuditData, null, 2)}

## LIGHTHOUSE ANALYSIS:
${JSON.stringify(lighthouseData, null, 2)}

## ALL PAGES LIGHTHOUSE:
${JSON.stringify(allPagesLighthouse, null, 2)}

## ANALYSIS FRAMEWORKS INCLUDED:
- Simon Sinek's Golden Circle (Why, How, What, Who)
- Bain & Company's Elements of Value (30 elements across 4 categories)
- Bain & Company's B2B Elements of Value (40 elements across 5 categories)
- Gallup's CliftonStrengths (34 themes across 4 domains)
- Technical Performance (Lighthouse metrics)
- SEO Analysis (PageAudit insights)

## REQUIRED OUTPUT FORMAT:
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

## CRITICAL REQUIREMENTS:
1. Base ALL insights on the ACTUAL data provided
2. Be SPECIFIC with evidence and metrics
3. Provide ACTIONABLE recommendations
4. Focus on BUSINESS IMPACT and GROWTH
5. Consider ALL frameworks holistically
6. Output ONLY valid JSON, no additional text
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
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not parse Gemini response as JSON');
  } catch (error) {
    console.error('Gemini insights generation failed:', error);
    return {
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
    };
  }
}

/**
 * Main comprehensive analysis function
 */
interface ComprehensiveAnalysisRequest {
  url: string;
  keyword?: string;
  includePageAudit: boolean;
  includeLighthouse: boolean;
  includeAllPages: boolean;
}

async function performComprehensiveAnalysis(request: ComprehensiveAnalysisRequest): Promise<ComprehensiveAnalysisResult> {
  const { _url, keyword, includePageAudit, includeLighthouse, includeAllPages } = request;
  
  console.log(`Starting comprehensive analysis for: ${url}`);
  
  // Step 1: Run base AI analysis (Golden Circle, Elements of Value, CliftonStrengths)
  console.log('Step 1: Running base AI analysis...');
  const baseAnalysis = await performRealAnalysis(url, 'full');
  
  let pageAuditData = null;
  let lighthouseData = null;
  let allPagesLighthouse = [];

  // Step 2: Run PageAudit analysis
  if (includePageAudit) {
    console.log('Step 2: Running PageAudit analysis...');
    pageAuditData = await runPageAuditAnalysis(url, keyword);
  }

  // Step 3: Run Lighthouse analysis
  if (includeLighthouse) {
    console.log('Step 3: Running Lighthouse analysis...');
    lighthouseData = await runLighthouseAnalysis(url);
  }

  // Step 4: Run Lighthouse on all pages (if requested)
  if (includeAllPages) {
    console.log('Step 4: Running Lighthouse on all pages...');
    allPagesLighthouse = await runLighthouseAllPages(url);
  }

  // Step 5: Generate comprehensive Gemini insights
  console.log('Step 5: Generating comprehensive Gemini insights...');
  const geminiInsights = await generateGeminiInsights(
    baseAnalysis,
    pageAuditData,
    lighthouseData,
    allPagesLighthouse
  );

  // Step 6: Combine all results
  const comprehensiveResult: ComprehensiveAnalysisResult = {
    ...baseAnalysis,
    pageAuditAnalysis: pageAuditData,
    lighthouseAnalysis: lighthouseData,
    allPagesLighthouse: allPagesLighthouse,
    geminiInsights: geminiInsights
  };

  console.log('Comprehensive analysis completed successfully');
  return comprehensiveResult;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = comprehensiveAnalysisSchema.parse(body);

    console.log(`Received comprehensive analysis request for URL: ${validatedData.url}`);

    // Perform comprehensive analysis
    const analysisResult = await performComprehensiveAnalysis(validatedData as ComprehensiveAnalysisRequest);

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Comprehensive analysis completed successfully',
      tools: {
        baseAnalysis: true,
        pageAudit: validatedData.includePageAudit,
        lighthouse: validatedData.includeLighthouse,
        allPagesLighthouse: validatedData.includeAllPages,
        geminiInsights: true
      }
    });

  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'COMPREHENSIVE_ANALYSIS_FAILED',
      message: error instanceof Error ? error.message : 'Comprehensive analysis failed',
      details: {
        type: 'comprehensive_analysis_error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.stack : 'Unknown error'
      }
    }, { status: 500 });
  }
}
