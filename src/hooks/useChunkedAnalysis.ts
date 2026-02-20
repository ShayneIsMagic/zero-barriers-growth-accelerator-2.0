'use client';

import { useState, useCallback } from 'react';
import type { ChunkProgressEvent } from '@/lib/chunked-framework-analysis';

interface ChunkedAnalysisState {
  isAnalyzing: boolean;
  percent: number;
  currentCategory: string;
  completedCategories: string[];
  result: any | null;
  error: string | null;
}

const INITIAL_STATE: ChunkedAnalysisState = {
  isAnalyzing: false,
  percent: 0,
  currentCategory: '',
  completedCategories: [],
  result: null,
  error: null,
};

/**
 * Hook that calls a streaming analysis endpoint and provides
 * real-time progress (percent, current category) as chunks complete.
 *
 * The endpoint must return newline-delimited JSON:
 *   { type: "progress", percent, categoryName, status, ... }
 *   { type: "result", data: { ... } }
 *   { type: "error", error: "..." }
 */
export function useChunkedAnalysis(endpoint: string) {
  const [state, setState] = useState<ChunkedAnalysisState>(INITIAL_STATE);

  const runAnalysis = useCallback(
    async (body: Record<string, unknown>) => {
      setState({
        ...INITIAL_STATE,
        isAnalyzing: true,
      });

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, stream: true }),
        });

        if (!response.ok || !response.body) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errData = await response.json();
            throw new Error(errData.error || `Server error ${response.status}`);
          }
          throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const event = JSON.parse(line);

              if (event.type === 'progress') {
                const progressEvent = event as ChunkProgressEvent;
                setState((prev) => ({
                  ...prev,
                  percent: progressEvent.percent,
                  currentCategory:
                    progressEvent.status === 'started'
                      ? progressEvent.categoryName
                      : prev.currentCategory,
                  completedCategories:
                    progressEvent.status === 'completed'
                      ? [...prev.completedCategories, progressEvent.categoryName]
                      : prev.completedCategories,
                }));
              } else if (event.type === 'result') {
                setState((prev) => ({
                  ...prev,
                  isAnalyzing: false,
                  percent: 100,
                  currentCategory: '',
                  result: event.data,
                }));
              } else if (event.type === 'error') {
                setState((prev) => ({
                  ...prev,
                  isAnalyzing: false,
                  error: event.error,
                }));
              }
            } catch {
              // ignore malformed lines
            }
          }
        }

        // Handle any remaining buffer
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer);
            if (event.type === 'result') {
              setState((prev) => ({
                ...prev,
                isAnalyzing: false,
                percent: 100,
                result: event.data,
              }));
            } else if (event.type === 'error') {
              setState((prev) => ({
                ...prev,
                isAnalyzing: false,
                error: event.error,
              }));
            }
          } catch {
            // ignore
          }
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: err instanceof Error ? err.message : 'Analysis failed',
        }));
      }
    },
    [endpoint]
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, runAnalysis, reset };
}
