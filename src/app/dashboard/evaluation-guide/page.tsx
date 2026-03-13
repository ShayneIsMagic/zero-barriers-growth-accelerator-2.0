'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface StageDetail {
  id: 'collect' | 'persist' | 'analyze' | 'report';
  label: string;
  title: string;
  summary: string;
  steps: string[];
}

const stageDetails: StageDetail[] = [
  {
    id: 'collect',
    label: 'Stage 1',
    title: 'Collect',
    summary:
      'Take URL + optional proposed content + framework selection and produce one canonical JSON payload.',
    steps: [
      'Inputs: url, frameworkType, optional proposedContent.',
      'Generate snapshotId during collection; it becomes the primary key downstream.',
      'Build canonical payload: url, snapshotId, collectedAt, collectorType, rawEvidence, proposedContent?.',
      'Collect language evidence streams consistently (headline, CTA, testimonial, claims, mission/purpose, navigation, alt/caption).',
    ],
  },
  {
    id: 'persist',
    label: 'Stage 2',
    title: 'Persist',
    summary:
      'Save payload and traceability hashes; this is the gate for all reuse and anti-recollection behavior.',
    steps: [
      'Save canonical payload to LocalForage, keyed by snapshotId.',
      'Write traceability hashes: existingContentHash, proposedContentHash, analysisHash.',
      'Reuse gate: never re-scrape unless user explicitly requests refresh.',
      'Allow framework reruns and cross-framework analysis from the same snapshotId.',
    ],
  },
  {
    id: 'analyze',
    label: 'Stage 3',
    title: 'Analyze',
    summary:
      'Run Ollama-first chunked analysis, merge chunks, synthesize unified output, and validate complete flat scoring.',
    steps: [
      'Use Ollama-first analysis path for framework pages.',
      'Chunking: 1 category per chunk for long/large inputs; 2 categories per chunk for shorter/medium inputs.',
      'Run block scoring -> merge all chunk outputs -> run unified synthesis over merged JSON.',
      'Validate every required element is scored between 0.0 and 1.0 before finalizing.',
    ],
  },
  {
    id: 'report',
    label: 'Stage 4',
    title: 'Report',
    summary:
      'Persist all report artifacts under the same snapshot and expose raw/analyzed/traceability tabs.',
    steps: [
      'Persist chunkedReport, unifiedReport, and readableMarkdown with the same snapshotId.',
      'Expose three tabs in UI: Raw payload, Analyzed scores/output, Traceability/version.',
      'Ensure report regeneration can happen without recollecting raw data.',
      'Keep artifact linking stable to maintain auditability.',
    ],
  },
];

export default function EvaluationGuidePage() {
  const [selectedStage, setSelectedStage] =
    useState<StageDetail['id']>('collect');

  const activeStage = useMemo(
    () =>
      stageDetails.find((stage) => stage.id === selectedStage) || stageDetails[0],
    [selectedStage]
  );

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Framework Evaluation Guide</h1>
        <p className="text-muted-foreground">
          Interactive process map for framework assessment pages.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary">Ollama-First</Badge>
          <Badge variant="secondary">Flat Scoring 0.0-1.0</Badge>
          <Badge variant="destructive">Do Not Modify Protected Pages</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Protected pages: <code>/dashboard/content-comparison</code> and{' '}
          <code>/dashboard/multi-page-scraping</code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canonical Pipeline Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <img
            src="/framework-page-analysis-pipeline.svg"
            alt="Framework page analysis pipeline"
            className="w-full rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Click a Stage for Deep Dive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {stageDetails.map((stage) => (
              <Button
                key={stage.id}
                type="button"
                variant={selectedStage === stage.id ? 'default' : 'outline'}
                className={cn('h-auto justify-start py-3 text-left')}
                onClick={() => setSelectedStage(stage.id)}
              >
                <span className="block">
                  <span className="block text-xs opacity-80">{stage.label}</span>
                  <span className="block text-sm font-semibold">{stage.title}</span>
                </span>
              </Button>
            ))}
          </div>

          <div className="rounded-md border p-4">
            <h3 className="text-lg font-semibold">
              {activeStage.label} - {activeStage.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeStage.summary}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {activeStage.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chunking Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Use <strong>1 category per chunk</strong> when content volume is high
            or prior runs time out.
          </p>
          <p>
            Use <strong>2 categories per chunk</strong> when framework/content
            size is moderate and stable.
          </p>
          <p>
            Always finish with unified synthesis and complete element-score
            validation.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reuse Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed p-4 text-sm">
            <ul className="list-disc space-y-1 pl-5">
              <li>Re-run same framework on same snapshotId.</li>
              <li>Run multiple frameworks on one snapshotId.</li>
              <li>Compare multiple proposed versions on one base snapshot.</li>
              <li>Regenerate unified/markdown reports without re-scraping.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        <Link href="/dashboard/elements-value-b2c">
          <Button>Open Framework Pages</Button>
        </Link>
      </div>
    </div>
  );
}
