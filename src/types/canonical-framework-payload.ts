export interface CanonicalFrameworkPayload {
  url: string;
  snapshotId: string;
  collectedAt: string;
  collectorType: string;
  rawEvidence: Record<string, unknown>;
  proposedContent?: string;
}

export interface CanonicalPayloadBuildInput {
  url: string;
  collectorType: string;
  rawEvidence: Record<string, unknown>;
  proposedContent?: string;
}

export function createSnapshotId(url: string): string {
  const now = Date.now();
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/\./g, '-');
    } catch {
      return 'unknown-host';
    }
  })();

  return `snap-${host}-${now}`;
}

export function buildCanonicalFrameworkPayload(
  input: CanonicalPayloadBuildInput
): CanonicalFrameworkPayload {
  return {
    url: input.url,
    snapshotId: createSnapshotId(input.url),
    collectedAt: new Date().toISOString(),
    collectorType: input.collectorType,
    rawEvidence: normalizeRawEvidence(input.rawEvidence),
    proposedContent: input.proposedContent,
  };
}

function isEvidenceRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    ('cleanText' in value ||
      'title' in value ||
      'wordCount' in value ||
      'headings' in value)
  );
}

function mergePageContentText(
  evidence: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  if (typeof evidence.cleanText === 'string' && evidence.cleanText.trim()) {
    return evidence;
  }

  const content = source.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return evidence;
  }

  const contentRecord = content as Record<string, unknown>;
  const cleanText =
    (typeof contentRecord.cleanText === 'string' ? contentRecord.cleanText : '') ||
    (typeof contentRecord.text === 'string' ? contentRecord.text : '');

  if (!cleanText) {
    return evidence;
  }

  return {
    ...evidence,
    cleanText,
  };
}

/**
 * Unwrap nested canonical payloads and page records into Flask/AI rawEvidence shape.
 */
export function normalizeRawEvidence(
  existingContent: Record<string, unknown>
): Record<string, unknown> {
  const nested = existingContent.rawEvidence;
  if (isEvidenceRecord(nested)) {
    return mergePageContentText(nested, existingContent);
  }

  if (isEvidenceRecord(existingContent)) {
    return mergePageContentText(existingContent, existingContent);
  }

  return mergePageContentText(existingContent, existingContent);
}
