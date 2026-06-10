/**
 * Transforms raw collector output into the standard existing-content shape
 * used by content-comparison and all framework analysis routes.
 */

import type {
  CollectedContentPayload,
  ContentHeadings,
} from '@/types/content-collection';

interface ComprehensivePage {
  content?: { text?: string };
  headings?: ContentHeadings;
  title?: string;
  metaDescription?: string;
  metaTags?: Record<string, string>;
  analytics?: Record<string, unknown>;
  keywords?: { allKeywords?: string[] };
}

interface ComprehensiveRawData {
  url: string;
  pages?: ComprehensivePage[];
  content?: { totalWords?: number };
}

export function extractKeywordsFromText(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

export function transformComprehensiveData(
  comprehensiveData: ComprehensiveRawData
): CollectedContentPayload {
  const allText = comprehensiveData.pages
    ? comprehensiveData.pages
        .map((page) => page.content?.text || '')
        .join('\n\n--- PAGE BREAK ---\n\n')
    : '';

  const allHeadings: ContentHeadings = comprehensiveData.pages
    ? {
        h1: comprehensiveData.pages.flatMap((page) => page.headings?.h1 || []),
        h2: comprehensiveData.pages.flatMap((page) => page.headings?.h2 || []),
        h3: comprehensiveData.pages.flatMap((page) => page.headings?.h3 || []),
      }
    : { h1: [], h2: [], h3: [] };

  const homepage = comprehensiveData.pages?.[0] || {};
  const metaTags = homepage.metaTags || {};
  const allKeywords =
    homepage.keywords?.allKeywords || extractKeywordsFromText(allText);

  return {
    title: metaTags.title || homepage.title || comprehensiveData.url,
    metaDescription: metaTags.description || homepage.metaDescription || '',
    wordCount:
      comprehensiveData.content?.totalWords || allText.split(/\s+/).length,
    extractedKeywords: allKeywords,
    headings: allHeadings,
    cleanText: allText,
    url: comprehensiveData.url,
    seo: {
      metaTitle: metaTags.title || homepage.title || '',
      metaDescription: metaTags.description || homepage.metaDescription || '',
      metaKeywords: metaTags.keywords || '',
      canonical: metaTags.canonical || '',
      ogTitle: metaTags.ogTitle || '',
      ogDescription: metaTags.ogDescription || '',
      ogImage: metaTags.ogImage || '',
      twitterCard: metaTags.twitterCard || '',
      twitterTitle: metaTags.twitterTitle || '',
      twitterDescription: metaTags.twitterDescription || '',
      robots: metaTags.robots || '',
      extractedKeywords: allKeywords,
      headings: allHeadings,
    },
    metaTags,
    analytics: homepage.analytics || {},
    keywords: homepage.keywords || {},
  };
}

/**
 * Normalize multi-page scrape results into the same existing-content shape.
 */
export function transformMultiPageData(multiPageData: {
  url: string;
  siteSummary?: {
    allKeywords?: string[];
    allHeadings?: string[];
    totalWordCount?: number;
  };
  pages?: Array<{
    title?: string;
    wordCount?: number;
    meta?: { description?: string };
    seo?: { headings?: ContentHeadings };
    content?: { text?: string; cleanText?: string };
  }>;
}): CollectedContentPayload {
  const pages = multiPageData.pages || [];
  const homepage = pages[0];
  const allText = pages
    .map((page) => page.content?.text || page.content?.cleanText || '')
    .filter(Boolean)
    .join('\n\n--- PAGE BREAK ---\n\n');

  const allHeadings: ContentHeadings = {
    h1: pages.flatMap((page) => page.seo?.headings?.h1 || []),
    h2: pages.flatMap((page) => page.seo?.headings?.h2 || []),
    h3: pages.flatMap((page) => page.seo?.headings?.h3 || []),
  };

  const keywords =
    multiPageData.siteSummary?.allKeywords ||
    extractKeywordsFromText(allText);

  return {
    title: homepage?.title || multiPageData.url,
    metaDescription: homepage?.meta?.description || '',
    wordCount: multiPageData.siteSummary?.totalWordCount || allText.split(/\s+/).length,
    extractedKeywords: keywords,
    headings: allHeadings,
    cleanText: allText,
    url: multiPageData.url,
    seo: {
      metaTitle: homepage?.title || '',
      metaDescription: homepage?.meta?.description || '',
      extractedKeywords: keywords,
      headings: allHeadings,
    },
  };
}
