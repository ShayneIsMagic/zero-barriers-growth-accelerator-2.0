'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { getUsageDashboardData, initializeUsageTracking } from '@/lib/vercel-usage-monitor';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Component that shows Vercel usage warnings
 */
export function VercelUsageWarning() {
  const [usageData, setUsageData] = useState<any>(null);

  useEffect(() => {
    // Initialize tracking on mount
    initializeUsageTracking();

    // Get current usage
    const data = getUsageDashboardData();
    setUsageData(data);
  }, []);

  if (!usageData || !usageData.hasWarnings) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="border-orange-500">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Vercel Usage Alert</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2">
            {usageData.warnings.map((warning: string, idx: number) => (
              <div key={idx} className="text-sm">
                {warning}
              </div>
            ))}

            <div className="mt-4 space-y-2">
              {usageData.bandwidth.percentage > 50 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Bandwidth</span>
                    <span>{usageData.bandwidth.percentage.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={usageData.bandwidth.percentage}
                    className={usageData.bandwidth.status === 'critical' ? 'bg-red-200' : 'bg-orange-200'}
                  />
                </div>
              )}

              {usageData.functions.percentage > 50 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Function Hours</span>
                    <span>{usageData.functions.percentage.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={usageData.functions.percentage}
                    className={usageData.functions.status === 'critical' ? 'bg-red-200' : 'bg-orange-200'}
                  />
                </div>
              )}
            </div>

            <p className="mt-3 text-xs">
              View detailed usage in your{' '}
              <a
                href="https://vercel.com/shayne-roys-projects/zero-barriers-growth-accelerator-2.0/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Vercel Dashboard
              </a>
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Usage dashboard component for admin panel
 */
export function VercelUsageDashboard() {
  const [usageData, setUsageData] = useState<any>(null);

  useEffect(() => {
    const data = getUsageDashboardData();
    setUsageData(data);
  }, []);

  if (!usageData) {
    return <div>Loading usage data...</div>;
  }

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg border">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Vercel Usage Monitor</h3>
      </div>

      <div className="space-y-4">
        {/* Bandwidth */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Bandwidth</span>
            <span className="text-muted-foreground">
              {usageData.bandwidth.used} / {usageData.bandwidth.total}
            </span>
          </div>
          <Progress value={usageData.bandwidth.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {usageData.bandwidth.percentage.toFixed(1)}% used this month
          </p>
        </div>

        {/* Function Hours */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Serverless Function Hours</span>
            <span className="text-muted-foreground">
              {usageData.functions.used}h / {usageData.functions.total}h
            </span>
          </div>
          <Progress value={usageData.functions.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {usageData.functions.percentage.toFixed(1)}% used this month
          </p>
        </div>

        {/* Build Minutes */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Build Minutes</span>
            <span className="text-muted-foreground">
              {usageData.builds.used}m / {usageData.builds.total}m
            </span>
          </div>
          <Progress value={usageData.builds.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {usageData.builds.percentage.toFixed(1)}% used this month
          </p>
        </div>
      </div>

      {usageData.warnings.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Usage Warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-sm mt-2">
              {usageData.warnings.map((warning: string, idx: number) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          This is an estimate based on local tracking.{' '}
          <a
            href="https://vercel.com/shayne-roys-projects/zero-barriers-growth-accelerator-2.0/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View actual usage in Vercel Dashboard →
          </a>
        </p>
      </div>
    </div>
  );
}

