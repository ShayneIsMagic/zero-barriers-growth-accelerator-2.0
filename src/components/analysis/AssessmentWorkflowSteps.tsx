'use client';

export type AssessmentWorkflowStepId =
  | 'collect'
  | 'persist'
  | 'analyze'
  | 'report';

const WORKFLOW_STEPS: Array<{
  id: AssessmentWorkflowStepId;
  label: string;
  description: string;
}> = [
  {
    id: 'collect',
    label: 'Collect',
    description: 'Gather canonical content',
  },
  {
    id: 'persist',
    label: 'Persist',
    description: 'Save to LocalForage',
  },
  {
    id: 'analyze',
    label: 'Analyze',
    description: 'Score framework chunks',
  },
  {
    id: 'report',
    label: 'Report',
    description: 'Review structured results',
  },
];

export interface AssessmentWorkflowStepsProps {
  currentStep: AssessmentWorkflowStepId;
}

export function resolveAssessmentWorkflowStep(options: {
  hasResult: boolean;
  isAnalyzing: boolean;
  isCollecting: boolean;
  hasCollectedContent?: boolean;
  isFlaskRunning?: boolean;
}): AssessmentWorkflowStepId {
  if (options.hasResult) {
    return 'report';
  }
  if (options.isAnalyzing || options.isFlaskRunning) {
    return 'analyze';
  }
  if (options.hasCollectedContent) {
    return 'persist';
  }
  if (options.isCollecting) {
    return 'collect';
  }
  return 'collect';
}

export function AssessmentWorkflowSteps({
  currentStep,
}: AssessmentWorkflowStepsProps) {
  const currentIndex = WORKFLOW_STEPS.findIndex(
    (step) => step.id === currentStep
  );

  return (
    <nav
      aria-label="Assessment workflow"
      className="rounded-lg border bg-muted/30 p-4"
    >
      <ol className="grid gap-3 sm:grid-cols-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <li
              key={step.id}
              className={`rounded-md border px-3 py-2 ${
                isCurrent
                  ? 'border-primary bg-primary/5'
                  : isComplete
                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40'
                    : 'border-transparent bg-background'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isComplete
                        ? 'bg-green-600 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              <p className="mt-1 pl-8 text-xs text-muted-foreground">
                {step.description}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
