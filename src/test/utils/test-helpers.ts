import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { AuthProvider } from '@/contexts/auth-context';

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock user for testing
 */
export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER' as const,
};

/**
 * Mock admin user for testing
 */
export const mockAdminUser = {
  id: 'test-admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'SUPER_ADMIN' as const,
};

/**
 * Mock analysis result for testing
 */
export const mockAnalysisResult = {
  id: 'test-analysis-1',
  url: 'https://example.com',
  timestamp: new Date(),
  overallScore: 75,
  executiveSummary: 'This is a test analysis summary.',
  goldenCircle: {
    why: {
      currentState: 'Test WHY',
      recommendations: ['Test recommendation 1'],
      evidence: ['Test evidence 1'],
      score: 8,
    },
    how: {
      currentState: 'Test HOW',
      recommendations: ['Test recommendation 2'],
      evidence: ['Test evidence 2'],
      score: 7,
    },
    what: {
      currentState: 'Test WHAT',
      recommendations: ['Test recommendation 3'],
      evidence: ['Test evidence 3'],
      score: 8,
    },
    who: {
      currentState: 'Test WHO',
      recommendations: ['Test recommendation 4'],
      evidence: ['Test evidence 4'],
      score: 7,
    },
    overallScore: 7.5,
  },
  elementsOfValue: {
    functional: { 'saves-time': 8, simplifies: 7 },
    emotional: { 'reduces-anxiety': 6 },
    lifeChanging: { 'provides-hope': 5 },
    socialImpact: { 'self-transcendence': 4 },
    overallScore: 6.5,
    insights: ['Test insight 1', 'Test insight 2'],
  },
  recommendations: {
    immediate: ['Fix immediate issue 1'],
    shortTerm: ['Improve short term 1'],
    longTerm: ['Plan long term 1'],
  },
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock fetch response helper
 */
export function mockFetch(data: any, ok = true, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
  );
}

/**
 * Mock fetch error helper
 */
export function mockFetchError(message = 'Network error') {
  global.fetch = vi.fn(() => Promise.reject(new Error(message)));
}

/**
 * Setup localStorage mock data
 */
export function setupLocalStorage(data: Record<string, any>) {
  (global.localStorage.getItem as any).mockImplementation((key: string) =>
    data[key] ? JSON.stringify(data[key]) : null
  );
}

/**
 * Clear all mocks
 */
export function clearAllMocks() {
  vi.clearAllMocks();
  (global.localStorage.clear as any)();
}

