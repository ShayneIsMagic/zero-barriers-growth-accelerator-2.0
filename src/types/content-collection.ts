/**
 * Shared content collection types.
 * Used by content-comparison, multi-page-scraping, and all framework pages.
 */

export type ContentCollectionMode = 'comprehensive' | 'multi-page';

export interface ContentCollectionOptions {
  mode?: ContentCollectionMode;
  maxPages?: number;
  maxDepth?: number;
  includeSubpages?: boolean;
  includeBlog?: boolean;
  includeProducts?: boolean;
  includeAbout?: boolean;
  includeContact?: boolean;
  includeServices?: boolean;
}

export interface ContentHeadings {
  h1: string[];
  h2: string[];
  h3: string[];
}

export interface ContentSeoPayload {
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  robots?: string;
  extractedKeywords: string[];
  headings: ContentHeadings;
}

export interface CollectedContentPayload {
  title: string;
  metaDescription: string;
  wordCount: number;
  extractedKeywords: string[];
  headings: ContentHeadings;
  cleanText: string;
  url: string;
  seo: ContentSeoPayload;
  metaTags?: Record<string, string>;
  analytics?: Record<string, unknown>;
  keywords?: Record<string, unknown>;
}

export interface ContentCollectionResult {
  mode: ContentCollectionMode;
  url: string;
  raw: unknown;
  existing: CollectedContentPayload;
  collectedAt: string;
}
