/**
 * Streaming helpers for chunked framework analysis.
 *
 * Server side: streamChunkedAnalysis() returns a ReadableStream Response
 * that emits newline-delimited JSON events (progress + final result).
 *
 * Client side: see useChunkedAnalysis hook in @/hooks/use-chunked-analysis.
 */

import type { ChunkedAnalysisOptions, ChunkProgressEvent } from '@/lib/chunked-framework-analysis';

function sanitizeError(msg: string): string {
  return msg
    .replace(/AIza[A-Za-z0-9_-]{30,}/g, '[REDACTED_KEY]')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED_KEY]')
    .replace(/api_key:[A-Za-z0-9_-]{20,}/g, 'api_key:[REDACTED_KEY]')
    .replace(/key=[A-Za-z0-9_-]{20,}/g, 'key=[REDACTED_KEY]');
}

interface StreamingAnalysisParams {
  analysisOptions: Omit<ChunkedAnalysisOptions, 'onProgress'>;
  buildResponse: (analysis: Record<string, unknown>) => Record<string, unknown>;
  frameworkLabel: string;
}

/**
 * Returns a streaming Response that emits progress events as each chunk
 * completes, then a final `{ type: 'result', data: ... }` event.
 */
export function streamChunkedAnalysis({
  analysisOptions,
  buildResponse,
  frameworkLabel,
}: StreamingAnalysisParams): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { analyzeFrameworkInChunks } = await import(
          '@/lib/chunked-framework-analysis'
        );

        const analysis = await analyzeFrameworkInChunks({
          ...analysisOptions,
          onProgress: (event: ChunkProgressEvent) => {
            controller.enqueue(
              encoder.encode(JSON.stringify(event) + '\n')
            );
          },
        });

        const finalPayload = buildResponse(analysis);

        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: 'result', data: finalPayload }) + '\n'
          )
        );
      } catch (error) {
        const msg = sanitizeError(error instanceof Error ? error.message : `${frameworkLabel} analysis failed`);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: 'error', error: msg }) + '\n'
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
