'use client';

import { useEffect, useState } from 'react';

export type FrameworkAnalysisEngine = 'ai-chunked' | 'flask-deterministic';

function parseClientEngineParam(
  value: string | null
): FrameworkAnalysisEngine | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === 'flask' ||
    normalized === 'deterministic' ||
    normalized === 'no-ai' ||
    normalized === 'flask-deterministic'
  ) {
    return 'flask-deterministic';
  }

  if (
    normalized === 'ai' ||
    normalized === 'ollama' ||
    normalized === 'ai-chunked' ||
    normalized === 'chunked'
  ) {
    return 'ai-chunked';
  }

  return null;
}

function readEngineFromUrl(): FrameworkAnalysisEngine | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  return (
    parseClientEngineParam(params.get('engine')) ??
    parseClientEngineParam(params.get('analysisEngine'))
  );
}

interface UseFrameworkAnalysisEngineOptions {
  preferDeterministic?: boolean;
  serverDefaultEngine?: FrameworkAnalysisEngine;
  flaskLoading?: boolean;
}

/**
 * Resolves analysis engine from URL (?engine=flask), server default, or AI fallback.
 *
 * Live site examples:
 *   /dashboard/elements-value-b2c?engine=flask
 *   /dashboard/elements-value-b2c?engine=ai
 */
export function useFrameworkAnalysisEngine(
  options: UseFrameworkAnalysisEngineOptions = {}
): {
  engine: FrameworkAnalysisEngine;
  setEngine: (engine: FrameworkAnalysisEngine) => void;
  engineFromUrl: FrameworkAnalysisEngine | null;
} {
  const [engineFromUrl, setEngineFromUrl] = useState<FrameworkAnalysisEngine | null>(
    null
  );
  const [engine, setEngine] = useState<FrameworkAnalysisEngine>('ai-chunked');

  useEffect(() => {
    setEngineFromUrl(readEngineFromUrl());
  }, []);

  useEffect(() => {
    if (options.flaskLoading) {
      return;
    }

    if (engineFromUrl) {
      setEngine(engineFromUrl);
      return;
    }

    if (options.serverDefaultEngine) {
      setEngine(options.serverDefaultEngine);
      return;
    }

    if (options.preferDeterministic) {
      setEngine('flask-deterministic');
    }
  }, [
    engineFromUrl,
    options.flaskLoading,
    options.preferDeterministic,
    options.serverDefaultEngine,
  ]);

  return { engine, setEngine, engineFromUrl };
}
