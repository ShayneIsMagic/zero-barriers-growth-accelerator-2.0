import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../utils/test-helpers';
import { GoldenCirclePage } from '@/components/analysis/GoldenCirclePage';
import { B2CElementsPage } from '@/components/analysis/B2CElementsPage';
import { B2BElementsPage } from '@/components/analysis/B2BElementsPage';
import { CliftonStrengthsPage } from '@/components/analysis/CliftonStrengthsPage';

const mockRunAnalysis = vi.fn();

vi.mock('@/hooks/useFrameworkPageAnalysis', () => ({
  useFrameworkPageAnalysis: () => ({
    isAnalyzing: false,
    isCollecting: false,
    isFromCache: false,
    percent: 0,
    currentCategory: '',
    completedCategories: [],
    result: null,
    error: null,
    canonicalPayload: null,
    collectedData: null,
    runAnalysis: mockRunAnalysis,
    clearCollected: vi.fn(),
  }),
}));

interface FrameworkPageCase {
  name: string;
  Component: () => React.ReactElement;
  heading: RegExp;
  workflowHeading: RegExp;
}

const FRAMEWORK_PAGES: FrameworkPageCase[] = [
  {
    name: 'Golden Circle',
    Component: GoldenCirclePage,
    heading: /Golden Circle Analysis/i,
    workflowHeading: /Golden Circle Workflow/i,
  },
  {
    name: 'B2C Elements',
    Component: B2CElementsPage,
    heading: /B2C Elements of Value Analysis/i,
    workflowHeading: /B2C Elements of Value Workflow/i,
  },
  {
    name: 'B2B Elements',
    Component: B2BElementsPage,
    heading: /B2B Elements of Value Analysis/i,
    workflowHeading: /B2B Elements of Value Workflow/i,
  },
  {
    name: 'CliftonStrengths',
    Component: CliftonStrengthsPage,
    heading: /CliftonStrengths Analysis/i,
    workflowHeading: /CliftonStrengths Workflow/i,
  },
];

describe('Framework analysis page views', () => {
  beforeEach(() => {
    mockRunAnalysis.mockClear();
  });

  it.each(FRAMEWORK_PAGES)(
    '$name renders URL input, analyze action, and workflow traceability panel',
    ({ Component, heading, workflowHeading }) => {
      renderWithProviders(<Component />);

      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      expect(
        screen.getByLabelText(/enter website url/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Analyze Existing Content/i })
      ).toBeInTheDocument();
      expect(screen.getByText(workflowHeading)).toBeInTheDocument();
    }
  );

  it.each(FRAMEWORK_PAGES)(
    '$name preserves optional scraped content override field',
    ({ Component }) => {
      renderWithProviders(<Component />);

      expect(
        screen.getByLabelText(/paste scraped content/i)
      ).toBeInTheDocument();
    }
  );
});
