import type { CollectedContentPayload } from '@/types/content-collection';

export interface FrameworkPageRunInput {
  url: string;
  proposedContent?: string;
  scrapedContent?: string;
  collectedContent?: CollectedContentPayload | null;
  setLocalError?: (message: string | null) => void;
}

export interface FrameworkPageRunParams {
  url: string;
  proposedContent: string;
  existingContent: CollectedContentPayload | Record<string, unknown> | null;
  skipCollection: boolean;
  analysisType: string;
}

export function buildFrameworkPageRunParams(
  input: FrameworkPageRunInput
): FrameworkPageRunParams | null {
  const trimmedUrl = input.url.trim();
  if (!trimmedUrl) {
    return null;
  }

  let existingContent: CollectedContentPayload | Record<string, unknown> | null =
    null;
  let skipCollection = false;

  if (input.collectedContent) {
    existingContent = input.collectedContent;
    skipCollection = true;
  } else if (input.scrapedContent?.trim()) {
    try {
      existingContent = JSON.parse(input.scrapedContent.trim()) as Record<
        string,
        unknown
      >;
      skipCollection = true;
    } catch {
      input.setLocalError?.('Invalid JSON in scraped content field');
      return null;
    }
  }

  return {
    url: trimmedUrl,
    proposedContent: input.proposedContent?.trim() ?? '',
    existingContent,
    skipCollection,
    analysisType: 'full',
  };
}
