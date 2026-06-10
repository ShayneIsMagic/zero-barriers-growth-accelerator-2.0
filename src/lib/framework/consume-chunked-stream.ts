/**
 * Client-side parser for NDJSON chunked analysis streams.
 * Shared by useChunkedAnalysis and FrameworkAnalysisRunner.
 */

import type { ChunkProgressEvent } from '@/lib/chunked-framework-analysis';

export interface ChunkedStreamPayload {
  success?: boolean;
  analysis?: Record<string, unknown>;
  readableMarkdown?: string | null;
  traceability?: unknown;
  error?: string;
  message?: string;
}

export interface ConsumeChunkedStreamOptions {
  onProgress?: (event: ChunkProgressEvent) => void;
}

export async function consumeChunkedAnalysisStream(
  response: Response,
  options: ConsumeChunkedStreamOptions = {}
): Promise<ChunkedStreamPayload> {
  if (!response.body) {
    throw new Error('Streaming response has no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload: ChunkedStreamPayload | null = null;
  let streamError: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      try {
        const event = JSON.parse(line) as {
          type?: string;
          error?: string;
          data?: ChunkedStreamPayload;
        } & ChunkProgressEvent;

        if (event.type === 'progress') {
          options.onProgress?.(event);
        } else if (event.type === 'result') {
          finalPayload = event.data ?? null;
        } else if (event.type === 'error') {
          streamError = event.error || 'Chunked analysis failed';
        }
      } catch {
        // ignore malformed lines
      }
    }
  }

  if (buffer.trim()) {
    try {
      const event = JSON.parse(buffer) as {
        type?: string;
        error?: string;
        data?: ChunkedStreamPayload;
      };
      if (event.type === 'result') {
        finalPayload = event.data ?? null;
      } else if (event.type === 'error') {
        streamError = event.error || 'Chunked analysis failed';
      }
    } catch {
      // ignore trailing parse errors
    }
  }

  if (streamError) {
    throw new Error(streamError);
  }

  if (!finalPayload) {
    throw new Error('Chunked analysis completed without a result payload');
  }

  if (finalPayload.success === false) {
    throw new Error(finalPayload.error || 'Chunked analysis failed');
  }

  return finalPayload;
}
