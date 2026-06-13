'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FrameworkAnalyzeActions } from '@/components/analysis/FrameworkAnalyzeActions';
import { deriveCollectionDisplayMeta } from '@/lib/framework/collection-meta';
import type { CollectedContentPayload } from '@/types/content-collection';
import type { ContentCollectionMode } from '@/types/content-collection';
import {
  CheckCircle2,
  Database,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export interface FrameworkCollectEvaluatePanelProps {
  endpoint: string;
  url: string;
  proposedContent?: string;
  scrapedContent?: string;
  setLocalError?: (message: string | null) => void;
  analyzeIcon: ReactNode;
  analysisMethod?: string;
  collectedData: CollectedContentPayload | null;
  rawCollectionData: unknown;
  collectionMode: ContentCollectionMode | null;
  isFromCache: boolean;
  isCollecting: boolean;
  isEvaluating: boolean;
  isFlaskRunning: boolean;
  isBusy: boolean;
  hasUrl: boolean;
  percent: number;
  currentCategory: string;
  completedCategories: string[];
  onCollect: () => void | Promise<void>;
  onRefreshCollection: () => void | Promise<void>;
  onRunAnalysis: () => void | Promise<void>;
  onRunDeterministic: () => void | Promise<void>;
}

export function FrameworkCollectEvaluatePanel({
  endpoint,
  url,
  analyzeIcon,
  analysisMethod,
  collectedData,
  rawCollectionData,
  collectionMode,
  isFromCache,
  isCollecting,
  isEvaluating,
  isFlaskRunning,
  isBusy,
  hasUrl,
  percent,
  currentCategory,
  completedCategories,
  onCollect,
  onRefreshCollection,
  onRunAnalysis,
  onRunDeterministic,
}: FrameworkCollectEvaluatePanelProps): React.ReactElement {
  const collectionMeta = deriveCollectionDisplayMeta(
    rawCollectionData,
    isFromCache,
    collectionMode,
    collectedData?.wordCount ?? null,
    collectedData?.title ?? null
  );

  const hasCollectedContent = Boolean(collectedData);
  const canEvaluate = hasCollectedContent && hasUrl && !isCollecting;

  return (
    <div className="space-y-4">
      {/* Step 1: Collect */}
      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Step 1 — Collect content</p>
            <p className="text-xs text-muted-foreground">
              Uses multi-page scraping (same as{' '}
              <Link
                href="/dashboard/multi-page-scraping"
                className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
              >
                Multi-Page Scraping
                <ExternalLink className="h-3 w-3" />
              </Link>
              ). Cached LocalForage data loads automatically when you enter a
              URL.
            </p>
          </div>
          {collectionMeta.source === 'cache' ? (
            <Badge variant="secondary" className="gap-1">
              <Database className="h-3 w-3" />
              From cache
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void onCollect()}
            disabled={!hasUrl || isBusy}
            className="flex-1 sm:flex-none"
          >
            {isCollecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Collecting...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                {hasCollectedContent ? 'Re-collect content' : 'Collect content'}
              </>
            )}
          </Button>

          {hasCollectedContent ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void onRefreshCollection()}
              disabled={!hasUrl || isBusy}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Force refresh
            </Button>
          ) : null}
        </div>

        {hasCollectedContent ? (
          <Alert>
            <AlertDescription className="text-sm">
              <span className="font-medium text-foreground">Ready for evaluation.</span>{' '}
              {collectionMeta.title ? (
                <>
                  <span className="text-muted-foreground">{collectionMeta.title}</span>
                  {' · '}
                </>
              ) : null}
              {collectionMeta.wordCount !== null
                ? `${collectionMeta.wordCount.toLocaleString()} words`
                : 'Content loaded'}
              {collectionMeta.pageCount !== null
                ? ` · ${collectionMeta.pageCount} page${collectionMeta.pageCount === 1 ? '' : 's'}`
                : ''}
              {collectionMeta.source === 'cache'
                ? ' · loaded from LocalForage (multi-page scrape cache)'
                : ' · saved to LocalForage'}
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-xs text-muted-foreground">
            No content loaded for{' '}
            {url.trim() || 'this URL'}. Run multi-page scraping here or on the
            Multi-Page Scraping page first.
          </p>
        )}
      </div>

      {/* Step 2: Evaluate */}
      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <p className="text-sm font-semibold">Step 2 — Run evaluation</p>
          <p className="text-xs text-muted-foreground">
            Score the collected content with AI (Gemini/Ollama) or deterministic
            Flask pattern matching. Requires Step 1 unless you pasted scraped JSON
            below.
          </p>
        </div>

        {!canEvaluate ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Complete Step 1 before running evaluation.
          </p>
        ) : null}

        <FrameworkAnalyzeActions
          endpoint={endpoint}
          isBusy={isEvaluating}
          isFlaskRunning={isFlaskRunning}
          hasUrl={canEvaluate}
          onRunAnalysis={onRunAnalysis}
          onRunDeterministic={onRunDeterministic}
          analysisMethod={analysisMethod}
          analyzeIcon={analyzeIcon}
        />
      </div>

      {/* Evaluation progress */}
      {isEvaluating ? (
        <div className="space-y-2">
          <Label>Evaluation progress</Label>
          <Progress value={percent} className="h-3" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {currentCategory
                ? `Evaluating ${currentCategory}...`
                : isFlaskRunning
                  ? 'Running deterministic evaluation...'
                  : 'Starting evaluation...'}
            </span>
            <span>{percent}%</span>
          </div>
          {completedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {completedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {cat}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
