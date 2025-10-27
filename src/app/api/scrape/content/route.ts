/**
 * Content Scraping API
 * Uses the same scraping approach as Content-Comparison page
 * Standalone service for scraping website content
 * Used by all assessment APIs to fetch content
 */

import { ContentCacheService } from '@/lib/services/content-cache.service';
import { UniversalPuppeteerScraper } from '@/lib/universal-puppeteer-scraper';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

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

    console.log(`🔍 Content scraping requested for: ${url}`);

    // Try to get from cache first
    if (ContentCacheService.hasContent(url)) {
      const cached = ContentCacheService.getCachedContent(url);
      if (cached) {
        console.log('📦 Returning cached content');
        return NextResponse.json({
          success: true,
          cached: true,
          content: cached,
        });
      }
    }

    // Scrape fresh content using UniversalPuppeteerScraper (same as content-comparison)
    console.log('🔍 Scraping fresh content...');
    const scrapedData = await UniversalPuppeteerScraper.scrapeWebsite(url);

    // Transform to match content-comparison format
    const content = {
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
    };

    // Cache the content
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

// Helper functions
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  const wordCount: { [key: string]: number } = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function extractHeadings(content: string) {
  const lines = content.split('\n');
  const h1 = lines
    .filter((line) => line.trim().startsWith('# '))
    .map((line) => line.trim().replace(/^#+\s*/, ''));
  const h2 = lines
    .filter((line) => line.trim().startsWith('## '))
    .map((line) => line.trim().replace(/^#+\s*/, ''));
  const h3 = lines
    .filter((line) => line.trim().startsWith('### '))
    .map((line) => line.trim().replace(/^#+\s*/, ''));

  return {
    h1: h1.slice(0, 10),
    h2: h2.slice(0, 10),
    h3: h3.slice(0, 10),
  };
}
