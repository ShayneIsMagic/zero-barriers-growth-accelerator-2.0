/**
 * Content version-control API helpers — AGENTS-app apiCall layer.
 */

import { apiCall } from '@/lib/api-call';

interface SnapshotMetadata {
  wordCount?: number;
  keywords?: string[];
  headings?: { h1?: string[]; h2?: string[]; h3?: string[] };
}

interface SaveSnapshotInput {
  url: string;
  title: string;
  content: string;
  metadata: SnapshotMetadata;
  userId?: string;
}

interface SaveSnapshotResponse {
  success: boolean;
  snapshot?: { id: string };
  error?: string;
}

interface ProposedContentResponse {
  success: boolean;
  proposedContent?: { id: string };
  error?: string;
}

interface VersionCompareResponse {
  success: boolean;
  error?: string;
}

export async function saveContentSnapshot(
  input: SaveSnapshotInput
): Promise<SaveSnapshotResponse> {
  const { data } = await apiCall<SaveSnapshotResponse>('/api/content/snapshots', {
    method: 'POST',
    body: {
      ...input,
      userId: input.userId ?? 'current-user',
    },
    showErrorToast: false,
  });
  return data ?? { success: false, error: 'No response from snapshot API' };
}

export async function createProposedContent(input: {
  snapshotId: string;
  content: string;
  createdBy?: string;
  status?: string;
}): Promise<ProposedContentResponse> {
  const { data } = await apiCall<ProposedContentResponse>('/api/content/proposed', {
    method: 'POST',
    body: {
      snapshotId: input.snapshotId,
      content: input.content,
      createdBy: input.createdBy ?? 'current-user',
      status: input.status ?? 'draft',
    },
    showErrorToast: false,
  });
  return data ?? { success: false, error: 'No response from proposed content API' };
}

export async function createVersionComparison(input: {
  existingId: string;
  proposedId: string;
  analysisResults?: unknown;
  similarityScore?: number | null;
}): Promise<VersionCompareResponse> {
  const { data } = await apiCall<VersionCompareResponse>('/api/content/compare', {
    method: 'POST',
    body: input,
    showErrorToast: false,
  });
  return data ?? { success: false, error: 'No response from version compare API' };
}
