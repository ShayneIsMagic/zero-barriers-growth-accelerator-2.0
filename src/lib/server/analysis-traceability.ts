import { createHash } from 'crypto';

interface ContentLike {
  cleanText?: string;
  title?: string;
  metaDescription?: string;
  wordCount?: number;
  url?: string;
}

function hashText(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function toStableJson(value: Record<string, unknown>): string {
  return JSON.stringify(value);
}

export function buildAnalysisTraceability(params: {
  url: string;
  existing: ContentLike;
  proposed?: ContentLike | null;
  analysis: Record<string, unknown>;
  usedProvidedExistingContent: boolean;
}): Record<string, unknown> {
  const existingText = params.existing.cleanText || '';
  const proposedText = params.proposed?.cleanText || '';
  const analysisJson = toStableJson(params.analysis);

  return {
    url: params.url,
    usedProvidedExistingContent: params.usedProvidedExistingContent,
    hasProposedContent: Boolean(params.proposed),
    hashes: {
      existingContentHash: hashText(existingText),
      proposedContentHash: params.proposed ? hashText(proposedText) : null,
      analysisHash: hashText(analysisJson),
    },
    summaries: {
      existing: {
        title: params.existing.title || '',
        metaDescription: params.existing.metaDescription || '',
        wordCount: params.existing.wordCount || 0,
        url: params.existing.url || params.url,
      },
      proposed: params.proposed
        ? {
            title: params.proposed.title || '',
            metaDescription: params.proposed.metaDescription || '',
            wordCount: params.proposed.wordCount || 0,
          }
        : null,
    },
  };
}
