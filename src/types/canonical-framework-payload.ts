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
    rawEvidence: input.rawEvidence,
    proposedContent: input.proposedContent,
  };
}
