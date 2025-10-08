import { NextRequest, NextResponse } from 'next/server';
import { PageAnalyzer, PageAnalysisRequest } from '@/lib/page-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, pageType = 'general', includeScreenshots = false, deepAnalysis = true } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const analyzer = new PageAnalyzer();
    
    const analysisRequest: PageAnalysisRequest = {
      url,
      pageType: pageType as any,
      includeScreenshots,
      deepAnalysis
    };

    const result = await analyzer.analyzePage(analysisRequest);

    return NextResponse.json({
      success: true,
      analysis: result,
      message: 'Page analysis completed successfully'
    });

  } catch (error) {
    console.error('Page analysis API error:', error);
    return NextResponse.json({ 
      error: 'Page analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
