/**
 * Content Scraping API
 * Uses Puppeteer locally, falls back to ProductionContentExtractor on Vercel
 * Standalone service for scraping website content
 * Used by all assessment APIs to fetch content
 *
 * ARCHITECTURE:
 * 1. Client checks LocalForage first (useAnalysisData hook)
 * 2. If no cached content, this API is called
 * 3. Locally: Puppeteer scrapes with full browser
 * 4. On Vercel: ProductionContentExtractor uses fetch (no Puppeteer needed)
 * 5. Result stored in LocalForage by the client for future use
 */

import { ContentCacheService } from '@/lib/services/content-cache.service';
import { ProductionContentExtractor } from '@/lib/production-content-extractor';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const isServerless =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Helper function to validate URL
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
        },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid URL: "${url}". URLs must start with http:// or https://`,
        },
        { status: 400 }
      );
    }

    // Try to get from server-side cache first
    if (ContentCacheService.hasContent(url)) {
      const cached = ContentCacheService.getCachedContent(url);
      if (cached) {
        return NextResponse.json({
          success: true,
          cached: true,
          content: cached,
        });
      }
    }

    let content;

    if (isServerless) {
      // VERCEL/PRODUCTION: Use ProductionContentExtractor (fetch-based, no Puppeteer)
      const extractor = new ProductionContentExtractor();
      const extractedData = await extractor.extractContent(url);

      content = {
        url,
        title: extractedData.title || 'Untitled',
        metaDescription: extractedData.metaDescription || '',
        wordCount: extractedData.wordCount || 0,
        cleanText: extractedData.content || '',
        extractedKeywords: [],
        headings: { h1: [], h2: [], h3: [] },
        seo: {
          metaTitle: extractedData.title || '',
          metaDescription: extractedData.metaDescription || '',
          extractedKeywords: [],
          headings: { h1: [], h2: [], h3: [] },
        },
        method: extractedData.method,
      };
    } else {
      // LOCAL DEVELOPMENT: Use Puppeteer (full browser, better scraping)
      const { UniversalPuppeteerScraper } = await import(
        '@/lib/universal-puppeteer-scraper'
      );
      const scrapedData = await UniversalPuppeteerScraper.scrapeWebsite(url);

      content = {
        url,
        title: scrapedData.title || 'Untitled',
        metaDescription: scrapedData.metaDescription || '',
        wordCount: scrapedData.wordCount || 0,
        cleanText: scrapedData.cleanText || '',
        extractedKeywords: scrapedData.seo?.extractedKeywords || [],
        headings: scrapedData.seo?.headings || { h1: [], h2: [], h3: [] },
        seo: {
          metaTitle: scrapedData.title || '',
          metaDescription: scrapedData.seo?.metaDescription || '',
          extractedKeywords: scrapedData.seo?.extractedKeywords || [],
          headings: scrapedData.seo?.headings || { h1: [], h2: [], h3: [] },
        },
        method: 'puppeteer',
      };
    }

    // Cache the content server-side
    const cached = await ContentCacheService.getContent(
      url,
      async () => content
    );

    return NextResponse.json({
      success: true,
      cached: false,
      content: cached,
    });
  } catch (error) {
    console.error('Content scraping error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Content scraping failed',
      },
      { status: 500 }
    );
  }
}
