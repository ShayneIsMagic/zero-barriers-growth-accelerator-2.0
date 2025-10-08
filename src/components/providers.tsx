'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth-context';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { useState } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              const errorObj = error as { status?: number };
              if (
                errorObj?.status &&
                errorObj.status >= 400 &&
                errorObj.status < 500
              ) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              const errorObj = error as { status?: number };
              if (
                errorObj?.status &&
                errorObj.status >= 400 &&
                errorObj.status < 500
              ) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
