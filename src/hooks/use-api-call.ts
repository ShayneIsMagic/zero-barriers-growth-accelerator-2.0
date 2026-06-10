'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiCall, type ApiCallOptions } from '@/lib/api-call';

interface UseAPICallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch on mount (GET by default). AGENTS-app useAPICall equivalent.
 */
export function useAPICall<T = unknown>(
  path: string | null,
  options?: Omit<ApiCallOptions, 'method'> & { method?: 'GET' }
): UseAPICallState<T> & { refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!path) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result } = await apiCall<T>(path, {
        method: 'GET',
        showErrorToast: true,
        ...options,
      });
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options intentionally excluded
  }, [path]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface TriggeredState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Manual trigger for POST/PUT/DELETE. AGENTS-app useTriggeredAPICall equivalent.
 */
export function useTriggeredAPICall<T = unknown>(): TriggeredState<T> & {
  trigger: (
    path: string,
    options?: ApiCallOptions
  ) => Promise<T | null>;
  reset: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(
    async (path: string, options?: ApiCallOptions): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data: result } = await apiCall<T>(path, {
          method: 'POST',
          showErrorToast: true,
          ...options,
        });
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Request failed';
        setError(message);
        setData(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback((): void => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, trigger, reset };
}
