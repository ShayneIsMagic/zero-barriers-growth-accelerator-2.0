'use client';

import { useState, useCallback } from 'react';
import type { ChunkProgressEvent } from '@/lib/chunked-framework-analysis';
import {
  buildCanonicalFrameworkPayload,
  CanonicalFrameworkPayload,
} from '@/types/canonical-framework-payload';
import { saveSnapshot } from '@/lib/snapshot-storage';
import { analyzeFrameworkWithAI } from '@/lib/framework-analysis-entrypoint';

interface ChunkedAnalysisState {
  isAnalyzing: boolean;
  percent: number;
  currentCategory: string;
  completedCategories: string[];
  result: any | null;
  error: string | null;
  canonicalPayload: CanonicalFrameworkPayload | null;
}

const INITIAL_STATE: ChunkedAnalysisState = {
  isAnalyzing: false,
  percent: 0,
  currentCategory: '',
  completedCategories: [],
  result: null,
  error: null,
  canonicalPayload: null,
};

const FRAMEWORK_NAME_BY_ENDPOINT: Record<string, string> = {
  '/api/analyze/elements-value-b2c-standalone': 'b2c-elements',
  '/api/analyze/elements-value-b2b-standalone': 'b2b-elements',
  '/api/analyze/clifton-strengths-standalone': 'clifton',
  '/api/analyze/golden-circle-standalone': 'golden-circle',
  '/api/analyze/brand-archetypes-standalone': 'brand-archetypes',
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
        const url = typeof body.url === 'string' ? body.url : '';
        const proposedContent =
          typeof body.proposedContent === 'string' ? body.proposedContent : '';
        const rawEvidence =
          typeof body.existingContent === 'object' && body.existingContent !== null
            ? (body.existingContent as Record<string, unknown>)
            : {};
        const collectorType =
          typeof body.collectorType === 'string'
            ? body.collectorType
            : 'framework-page-collector';

        const canonicalPayload = buildCanonicalFrameworkPayload({
          url,
          collectorType,
          rawEvidence,
          proposedContent,
        });
        await saveSnapshot(canonicalPayload.snapshotId, canonicalPayload);

        const frameworkName = FRAMEWORK_NAME_BY_ENDPOINT[endpoint];
        if (!frameworkName) {
          throw new Error(`Unsupported analysis endpoint: ${endpoint}`);
        }

        setState((prev) => ({
          ...prev,
          canonicalPayload,
        }));

        const response = await analyzeFrameworkWithAI({
          frameworkName,
          payload: canonicalPayload,
          stream: true,
          analysisType:
            typeof body.analysisType === 'string' ? body.analysisType : 'full',
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
                  result: {
                    ...event.data,
                    canonicalPayload: prev.canonicalPayload,
                  },
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
                result: {
                  ...event.data,
                  canonicalPayload: prev.canonicalPayload,
                },
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
