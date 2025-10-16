import { MultiPageContentScraper } from '@/lib/multi-page-content-scraper';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes for Vercel serverless function

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, options = {} } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🌐 Starting multi-page content scraping for: ${url}`);
    console.log(`📊 Options:`, options);

    const result = await MultiPageContentScraper.scrapeMultiPageContent(url, options);

    console.log(`✅ Multi-page scraping completed for: ${url}`);
    console.log(`📄 Total pages: ${result.siteMap.totalPages}`);
    console.log(`🎯 Page types:`, result.siteMap.pageTypes);

    return NextResponse.json({
      success: true,
      data: result,
      summary: {
        totalPages: result.siteMap.totalPages,
        pageTypes: result.siteMap.pageTypes,
        contentThemes: result.comprehensiveContent.contentThemes,
        totalKeywords: result.comprehensiveContent.allKeywords.length,
        totalHeadings: result.comprehensiveContent.allHeadings.length
      }
    });

  } catch (error) {
    console.error('Multi-page content scraping failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Multi-page content scraping failed'
    }, { status: 500 });
  }
}
