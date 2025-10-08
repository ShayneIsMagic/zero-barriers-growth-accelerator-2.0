import { NextRequest, NextResponse } from 'next/server';
import { extractWithProduction } from '@/lib/production-content-extractor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`🔍 Extracting content from ${url}...`);
    
    // Use the production content extractor (Enhanced Fetch API)
    const result = await extractWithProduction(url);
    
    return NextResponse.json({
      success: true,
      content: result.content,
      title: result.title,
      metaDescription: result.metaDescription,
      wordCount: result.wordCount,
      imageCount: result.imageCount,
      linkCount: result.linkCount,
      headingCount: result.headingCount,
      paragraphCount: result.paragraphCount,
      listCount: result.listCount,
      formCount: result.formCount,
      videoCount: result.videoCount,
      socialMediaLinks: result.socialMediaLinks,
      contactInfo: result.contactInfo,
      technicalInfo: result.technicalInfo,
      extractedAt: result.extractedAt,
      method: result.method
    });

  } catch (error) {
    console.error('Page scraping error:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape page',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
