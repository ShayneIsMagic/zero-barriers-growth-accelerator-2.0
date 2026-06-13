import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../utils/test-helpers';
import { GoldenCirclePage } from '@/components/analysis/GoldenCirclePage';
import { B2CElementsPage } from '@/components/analysis/B2CElementsPage';
import { B2BElementsPage } from '@/components/analysis/B2BElementsPage';
import { CliftonStrengthsPage } from '@/components/analysis/CliftonStrengthsPage';

const mockRunEvaluationAi = vi.fn();

const mockCollectEvaluateReturn = {
  isAnalyzing: false,
  isEvaluating: false,
  isCollecting: false,
  isFlaskRunning: false,
  isFromCache: false,
  collectedData: null,
  rawCollectionData: null,
  collectionMode: null,
  percent: 0,
  currentCategory: '',
  completedCategories: [],
  result: null,
  error: null,
  analysisMethod: 'ai-chunked',
  canonicalPayload: null,
  handleCollect: vi.fn(),
  handleRefreshCollection: vi.fn(),
  runEvaluationAi: mockRunEvaluationAi,
  runEvaluationFlask: vi.fn(),
  hasCollectedContent: false,
  clearCollected: vi.fn(),
  clearFlaskResult: vi.fn(),
};

vi.mock('@/hooks/useFrameworkCollectEvaluateWorkflow', () => ({
  useFrameworkCollectEvaluateWorkflow: () => mockCollectEvaluateReturn,
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
    mockRunEvaluationAi.mockClear();
  });

  it.each(FRAMEWORK_PAGES)(
    '$name renders URL input, collect/evaluate actions, and workflow traceability panel',
    ({ Component, heading, workflowHeading }) => {
      renderWithProviders(<Component />);

      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      expect(
        screen.getByLabelText(/enter website url/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Collect content/i })
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
