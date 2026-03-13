'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, ListChecks, Sparkles } from 'lucide-react';

interface WorkflowTraceabilityPanelProps {
  featureName: string;
  collectionPrompts: string[];
  executionSteps: string[];
  rawData?: unknown;
  analyzedData?: unknown;
  traceabilityData?: unknown;
  versionInfo?: Record<string, unknown> | null;
}

function formatData(value: unknown): string {
  if (value === null || value === undefined) {
    return 'No data available yet.';
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

export function WorkflowTraceabilityPanel({
  featureName,
  collectionPrompts,
  executionSteps,
  rawData,
  analyzedData,
  traceabilityData,
  versionInfo,
}: WorkflowTraceabilityPanelProps): React.ReactElement {
  const hasTraceData =
    rawData !== undefined || analyzedData !== undefined || traceabilityData !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <ListChecks className='h-5 w-5 text-blue-600' />
          {featureName} Workflow
        </CardTitle>
        <CardDescription>
          Collection and execution are separated for transparency and repeatability.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-lg border bg-blue-50 p-4 dark:bg-blue-950'>
          <div className='mb-2 flex items-center gap-2'>
            <Sparkles className='h-4 w-4 text-blue-600' />
            <h4 className='font-semibold'>Step 1: Collection Prompts (Puppeteer Signals)</h4>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline'>Source: Website language signals</Badge>
            <Badge variant='outline'>Method: Puppeteer/fetch extraction</Badge>
          </div>
          <ul className='mt-3 space-y-1 text-sm'>
            {collectionPrompts.map((item, index) => (
              <li key={`${item}-${index}`} className='flex items-start gap-2'>
                <span className='mt-1'>-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='rounded-lg border bg-green-50 p-4 dark:bg-green-950'>
          <div className='mb-2 flex items-center gap-2'>
            <ListChecks className='h-4 w-4 text-green-600' />
            <h4 className='font-semibold'>Step 2: Execution (Analysis)</h4>
          </div>
          <ul className='space-y-1 text-sm'>
            {executionSteps.map((item, index) => (
              <li key={`${item}-${index}`} className='flex items-start gap-2'>
                <span className='mt-1'>-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='rounded-lg border p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <Database className='h-4 w-4 text-purple-600' />
            <h4 className='font-semibold'>Step 3: Raw Data vs Analyzed Data</h4>
          </div>
          {versionInfo ? (
            <div className='mb-3 rounded border bg-muted/40 p-3'>
              <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                Version Context
              </div>
              <pre className='max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs'>
                {formatData(versionInfo)}
              </pre>
            </div>
          ) : null}
          {hasTraceData ? (
            <Tabs defaultValue='raw' className='w-full'>
              <TabsList>
                <TabsTrigger value='raw'>Raw Data</TabsTrigger>
                <TabsTrigger value='analyzed'>Analyzed Data</TabsTrigger>
                <TabsTrigger value='traceability'>Traceability</TabsTrigger>
              </TabsList>
              <TabsContent value='raw' className='mt-3'>
                <pre className='max-h-72 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs'>
                  {formatData(rawData)}
                </pre>
              </TabsContent>
              <TabsContent value='analyzed' className='mt-3'>
                <pre className='max-h-72 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs'>
                  {formatData(analyzedData)}
                </pre>
              </TabsContent>
              <TabsContent value='traceability' className='mt-3'>
                <pre className='max-h-72 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs'>
                  {formatData(traceabilityData)}
                </pre>
              </TabsContent>
            </Tabs>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Run an analysis to view side-by-side raw extraction and analyzed outputs.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
