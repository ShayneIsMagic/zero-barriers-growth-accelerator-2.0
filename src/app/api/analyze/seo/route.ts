import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { performSEOAnalysis, SEOAnalysisRequest } from '@/lib/seo-analysis-service';

// Request validation schema
const seoAnalysisSchema = z.object({
  url: z.string().url('Invalid URL format'),
  targetKeywords: z.array(z.string()).optional(),
  competitorUrls: z.array(z.string().url()).optional(),
  includeSearchConsole: z.boolean().default(true),
  includeKeywordResearch: z.boolean().default(true),
  includeCompetitiveAnalysis: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedData = seoAnalysisSchema.parse(body);
    
    console.log(`🔍 Starting SEO analysis for: ${validatedData.url}`);
    
    // Perform SEO analysis following the practical workflow
    const seoAnalysis = await performSEOAnalysis({
      url: validatedData.url,
      targetKeywords: validatedData.targetKeywords || [],
      competitorUrls: validatedData.competitorUrls || [],
      includeSearchConsole: validatedData.includeSearchConsole,
      includeKeywordResearch: validatedData.includeKeywordResearch,
      includeCompetitiveAnalysis: validatedData.includeCompetitiveAnalysis,
    });
    
    console.log('✅ SEO analysis completed successfully');
    
    return NextResponse.json({
      success: true,
      data: seoAnalysis,
      message: 'SEO analysis completed successfully',
      analysisType: 'seo',
      url: validatedData.url,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('SEO analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'SEO analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL parameter is required'
      }, { status: 400 });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format'
      }, { status: 400 });
    }
    
    console.log(`🔍 Starting SEO analysis for: ${url}`);
    
    // Perform basic SEO analysis
    const seoAnalysis = await performSEOAnalysis({
      url: url,
      includeSearchConsole: true,
      includeKeywordResearch: true,
      includeCompetitiveAnalysis: true,
    });
    
    return NextResponse.json({
      success: true,
      data: seoAnalysis,
      message: 'SEO analysis completed successfully',
      analysisType: 'seo',
      url: url,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('SEO analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'SEO analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
