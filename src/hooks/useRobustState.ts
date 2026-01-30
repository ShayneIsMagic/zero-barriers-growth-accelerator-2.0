/**
 * Robust state management hook with error handling and loading states
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface RobustState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface RobustStateActions<T> {
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
}

export function useRobustState<T>(
  initialData: T | null = null
): [RobustState<T>, RobustStateActions<T>] {
  const [state, setState] = useState<RobustState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback((updater: Partial<RobustState<T>>) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...updater }));
    }
  }, []);

  const setData = useCallback(
    (data: T) => {
      safeSetState({
        data,
        loading: false,
        error: null,
        success: true,
      });
    },
    [safeSetState]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      safeSetState({ loading });
    },
    [safeSetState]
  );

  const setError = useCallback(
    (error: string | null) => {
      safeSetState({
        error,
        loading: false,
        success: false,
      });
    },
    [safeSetState]
  );

  const reset = useCallback(() => {
    safeSetState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
    });
  }, [safeSetState, initialData]);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
        setError(errorMessage);
        // RobustState execution error - handled by setError above
      }
    },
    [setLoading, setError, setData]
  );

  const actions: RobustStateActions<T> = {
    setData,
    setLoading,
    setError,
    reset,
    execute,
  };

  return [state, actions];
}

/**
 * Hook for managing API calls with retry logic
 */
export function useApiCall<T>() {
  const [state, actions] = useRobustState<T>();

  const callApi = useCallback(
    async (
      apiCall: () => Promise<T>,
      options: {
        retries?: number;
        retryDelay?: number;
        onRetry?: (attempt: number) => void;
      } = {}
    ) => {
      const { retries = 3, retryDelay = 1000, onRetry } = options;
      let lastError: Error;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const result = await apiCall();
          actions.setData(result);
          return result;
        } catch (error) {
          lastError = error as Error;

          if (attempt < retries) {
            onRetry?.(attempt);
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * attempt)
            );
          }
        }
      }

      actions.setError(lastError!.message);
      throw lastError!;
    },
    [actions]
  );

  return {
    ...state,
    callApi,
    reset: actions.reset,
  };
}
