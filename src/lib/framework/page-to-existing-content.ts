/**
 * Converts a single Puppeteer page record (from content comparison collection)
 * into the existingContent shape expected by chunked framework analysis routes.
 */

import { extractKeywordsFromText } from '@/lib/server/content-collection/transform';
import type {
  CollectedContentPayload,
  ContentHeadings,
} from '@/types/content-collection';

export interface PuppeteerPageRecord {
  url?: string;
  title?: string;
  metaDescription?: string;
  pageLabel?: string;
  content?: {
    text?: string;
    cleanText?: string;
    wordCount?: number;
    headings?: ContentHeadings;
    links?: Array<{ text?: string }>;
    buttons?: Array<{ text?: string; ariaLabel?: string }>;
    images?: Array<{ alt?: string }>;
  };
  headings?: ContentHeadings & {
    h4?: string[];
    h5?: string[];
    h6?: string[];
  };
  keywords?: {
    allKeywords?: string[];
    extractedKeywords?: string[];
    metaKeywords?: string[];
  };
  metaTags?: Record<string, string>;
  analytics?: Record<string, unknown>;
  seo?: {
    extractedKeywords?: string[];
    imageAltTexts?: string[];
    schemaMarkup?: unknown;
    headings?: ContentHeadings;
  };
  tags?: { semanticTags?: unknown };
}

function normalizeHeadings(page: PuppeteerPageRecord): ContentHeadings {
  const fromPage = page.headings;
  const fromContent = page.content?.headings;
  const fromSeo = page.seo?.headings;

  return {
    h1: fromPage?.h1 || fromContent?.h1 || fromSeo?.h1 || [],
    h2: fromPage?.h2 || fromContent?.h2 || fromSeo?.h2 || [],
    h3: fromPage?.h3 || fromContent?.h3 || fromSeo?.h3 || [],
  };
}

export function transformPageToExistingContent(
  page: PuppeteerPageRecord,
  pageUrl: string
): CollectedContentPayload {
  const cleanText = page.content?.text || page.content?.cleanText || '';
  const headings = normalizeHeadings(page);
  const extractedKeywords =
    page.keywords?.allKeywords ||
    page.keywords?.extractedKeywords ||
    page.seo?.extractedKeywords ||
    extractKeywordsFromText(cleanText);

  const metaTags = page.metaTags || {};
  const title =
    page.title || metaTags.title || page.pageLabel || pageUrl;
  const metaDescription =
    page.metaDescription || metaTags.description || '';

  return {
    title,
    metaDescription,
    wordCount:
      page.content?.wordCount ||
      (cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0),
    extractedKeywords,
    headings,
    cleanText,
    url: page.url || pageUrl,
    seo: {
      metaTitle: title,
      metaDescription,
      metaKeywords: metaTags.keywords || '',
      canonical: metaTags.canonical || '',
      ogTitle: metaTags.ogTitle || '',
      ogDescription: metaTags.ogDescription || '',
      ogImage: metaTags.ogImage || '',
      twitterCard: metaTags.twitterCard || '',
      twitterTitle: metaTags.twitterTitle || '',
      twitterDescription: metaTags.twitterDescription || '',
      robots: metaTags.robots || '',
      extractedKeywords,
      headings,
    },
    metaTags,
    analytics: page.analytics || {},
    keywords: page.keywords || {},
  };
}

export function buildExistingContentForChunkedAnalysis(
  page: PuppeteerPageRecord,
  pageUrl: string
): Record<string, unknown> {
  const existing = transformPageToExistingContent(page, pageUrl);
  return {
    ...existing,
    content: page.content,
  };
}

export function normalizePageUrlForMatch(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    const base = `${parsed.origin}${parsed.pathname}${parsed.search}`;
    return parsed.pathname !== '/' && base.endsWith('/')
      ? base.slice(0, -1)
      : base;
  } catch {
    return url.trim().split('#')[0].replace(/\/$/, '');
  }
}

export function pageUrlsMatch(a: string, b: string): boolean {
  return normalizePageUrlForMatch(a) === normalizePageUrlForMatch(b);
}

/**
 * Pick one page to analyze first: preferred URL (entered URL), else homepage, else first collected.
 */
export function pickPrimaryPageUrl(
  pages: Array<{ url: string }>,
  preferredUrl?: string
): string | null {
  if (pages.length === 0) {
    return null;
  }

  if (preferredUrl?.trim()) {
    const match = pages.find((page) => pageUrlsMatch(page.url, preferredUrl));
    if (match) {
      return match.url;
    }
  }

  const homepage = pages.find((page) => {
    try {
      const pathname = new URL(page.url).pathname;
      return pathname === '/' || pathname === '';
    } catch {
      return false;
    }
  });

  return homepage?.url ?? pages[0].url;
}
