import {
  transformComprehensiveData,
  transformMultiPageData,
} from '@/lib/server/content-collection/transform';
import type { CollectedContentPayload } from '@/types/content-collection';

function isCollectedPayload(value: unknown): value is CollectedContentPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CollectedContentPayload).cleanText === 'string' &&
    typeof (value as CollectedContentPayload).url === 'string'
  );
}

function hasPagesArray(value: Record<string, unknown>): boolean {
  return Array.isArray(value.pages);
}

function hasSiteSummary(value: Record<string, unknown>): boolean {
  return 'siteSummary' in value;
}

/**
 * Normalize compare / multi-page / LocalForage payloads into the shared existing-content shape.
 */
export function resolveCollectedContentPayload(
  raw: unknown,
  fallbackUrl?: string
): CollectedContentPayload | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;

  if (isCollectedPayload(record)) {
    return record;
  }

  const nestedExisting = record.existing;
  if (isCollectedPayload(nestedExisting)) {
    return nestedExisting;
  }

  if (hasPagesArray(record) && hasSiteSummary(record)) {
    return transformMultiPageData(
      record as unknown as Parameters<typeof transformMultiPageData>[0]
    );
  }

  if (hasPagesArray(record)) {
    return transformComprehensiveData(
      record as unknown as Parameters<typeof transformComprehensiveData>[0]
    );
  }

  if (fallbackUrl && typeof record.cleanText === 'string') {
    const partial = record as unknown as CollectedContentPayload;
    return {
      ...partial,
      url: typeof record.url === 'string' ? record.url : fallbackUrl,
    };
  }

  return null;
}
