/**
 * Unified content collection service.
 * Always uses PuppeteerComprehensiveCollector (local Chrome or Vercel @sparticuz/chromium).
 * Same protocol as live content-comparison — homepage-first by default.
 */

import { PuppeteerComprehensiveCollector } from '@/lib/puppeteer-comprehensive-collector';
import type {
  CollectedContentPayload,
  ContentCollectionMode,
  ContentCollectionOptions,
  ContentCollectionResult,
} from '@/types/content-collection';
import {
  CONTENT_COLLECTION_DEFAULTS,
  resolveContentCollectionOptions,
} from './config';
import {
  transformComprehensiveData,
  transformMultiPageData,
} from './transform';

export interface CollectContentInput {
  url: string;
  mode?: ContentCollectionMode;
  options?: ContentCollectionOptions;
}

export interface CollectContentOutput {
  result: ContentCollectionResult;
  comprehensiveRaw?: unknown;
}

export async function collectWebsiteContent(
  input: CollectContentInput
): Promise<CollectContentOutput> {
  const mode = input.mode ?? 'comprehensive';
  const options = resolveContentCollectionOptions(input.options);

  if (mode === 'multi-page') {
    return collectMultiPageContent(input.url, options);
  }

  return collectComprehensiveContent(input.url, options);
}

async function collectComprehensiveContent(
  url: string,
  options: ContentCollectionOptions
): Promise<CollectContentOutput> {
  const maxPages =
    options.includeSubpages === false
      ? 0
      : (options.maxPages ?? CONTENT_COLLECTION_DEFAULTS.maxPages);
  const maxDepth = options.maxDepth ?? CONTENT_COLLECTION_DEFAULTS.maxDepth;

  const collector = new PuppeteerComprehensiveCollector({
    maxPages,
    maxDepth,
    timeout: CONTENT_COLLECTION_DEFAULTS.timeoutMs,
  });

  const comprehensiveRaw = await collector.collectComprehensiveData(url);
  const existing = transformComprehensiveData(
    comprehensiveRaw as unknown as Parameters<typeof transformComprehensiveData>[0]
  );

  return {
    comprehensiveRaw,
    result: {
      mode: 'comprehensive',
      url,
      raw: comprehensiveRaw,
      existing,
      collectedAt: new Date().toISOString(),
    },
  };
}

async function collectMultiPageContent(
  url: string,
  options?: ContentCollectionOptions
): Promise<CollectContentOutput> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://127.0.0.1:3000';

  const response = await fetch(`${baseUrl}/api/scrape-multi-page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, options: options ?? {} }),
  });

  const payload = (await response.json()) as {
    success: boolean;
    data?: Parameters<typeof transformMultiPageData>[0];
    error?: string;
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || 'Multi-page collection failed');
  }

  const existing = transformMultiPageData(payload.data);

  return {
    result: {
      mode: 'multi-page',
      url,
      raw: payload.data,
      existing,
      collectedAt: new Date().toISOString(),
    },
  };
}
