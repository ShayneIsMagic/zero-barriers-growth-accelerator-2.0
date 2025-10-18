'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Play } from 'lucide-react';

interface GoogleToolsButtonsProps {
  url: string;
  onToolComplete?: (tool: string, data: any) => void;
}

export function GoogleToolsButtons({ _url, onToolComplete }: GoogleToolsButtonsProps) {
  const [lighthouseRunning, setLighthouseRunning] = useState(false);
  const [lighthouseData, setLighthouseData] = useState<any>(null);
  const [lighthouseError, setLighthouseError] = useState<string | null>(null);

  const [trendsRunning, setTrendsRunning] = useState(false);
  const [trendsData, setTrendsData] = useState<any>(null);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  const runLighthouse = async () => {
    setLighthouseRunning(true);
    setLighthouseError(null);

    try {
      const response = await fetch('/api/tools/lighthouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (data.success) {
        setLighthouseData(data);
        onToolComplete?.('lighthouse', data);
      } else {
        setLighthouseError(data.error || 'Failed to run Lighthouse');
      }
    } catch (error) {
      setLighthouseError('Network error');
    } finally {
      setLighthouseRunning(false);
    }
  };

  const runTrends = async (keywords: string[]) => {
    setTrendsRunning(true);
    setTrendsError(null);

    try {
      const response = await fetch('/api/tools/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      });

      const data = await response.json();

      if (data.success) {
        setTrendsData(data);
        onToolComplete?.('trends', data);
      } else {
        setTrendsError(data.error || 'Failed to analyze trends');
      }
    } catch (error) {
      setTrendsError('Network error');
    } finally {
      setTrendsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Google Tools - Click to Run</h3>

      {/* Lighthouse Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Google Lighthouse</CardTitle>
              <CardDescription>Performance, Accessibility, SEO scores</CardDescription>
            </div>
            {lighthouseData && <CheckCircle className="h-5 w-5 text-green-500" />}
            {lighthouseError && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={runLighthouse}
            disabled={lighthouseRunning || !!lighthouseData}
            className="w-full"
          >
            {lighthouseRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Lighthouse...
              </>
            ) : lighthouseData ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Lighthouse Complete
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Lighthouse
              </>
            )}
          </Button>

          {lighthouseData && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 border rounded">
                <div className="text-muted-foreground">Performance</div>
                <div className="text-xl font-bold">{lighthouseData.scores.performance}/100</div>
              </div>
              <div className="p-2 border rounded">
                <div className="text-muted-foreground">Accessibility</div>
                <div className="text-xl font-bold">{lighthouseData.scores.accessibility}/100</div>
              </div>
              <div className="p-2 border rounded">
                <div className="text-muted-foreground">Best Practices</div>
                <div className="text-xl font-bold">{lighthouseData.scores.bestPractices}/100</div>
              </div>
              <div className="p-2 border rounded">
                <div className="text-muted-foreground">SEO</div>
                <div className="text-xl font-bold">{lighthouseData.scores.seo}/100</div>
              </div>
            </div>
          )}

          {lighthouseError && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded text-sm text-red-900 dark:text-red-100">
                ❌ Automated failed: {lighthouseError}
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ✋ Manual Fallback - Use This Instead:
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 mb-3">
                  <li>1. Go to: <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" className="underline font-mono">https://pagespeed.web.dev/</a></li>
                  <li>2. Enter your URL: <code className="bg-blue-100 dark:bg-blue-900 px-1">{url}</code></li>
                  <li>3. Click &quot;Analyze&quot;</li>
                  <li>4. Copy the 4 scores (Performance, Accessibility, Best Practices, SEO)</li>
                  <li>5. Paste into Gemini with this prompt:</li>
                </ol>
                <div className="bg-white dark:bg-gray-900 p-3 rounded border text-xs">
                  <pre className="whitespace-pre-wrap">
{`Analyze these Lighthouse scores for ${url}:
- Performance: [YOUR_SCORE]/100
- Accessibility: [YOUR_SCORE]/100
- Best Practices: [YOUR_SCORE]/100
- SEO: [YOUR_SCORE]/100

Key Issues:
[PASTE TOP 3-5 ISSUES FROM REPORT]

Provide:
1. What these scores mean
2. Priority fixes
3. Quick wins (< 1 hour)
4. Impact on user experience`}
                  </pre>
                </div>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    const prompt = `Analyze these Lighthouse scores for ${url}:\n- Performance: [YOUR_SCORE]/100\n- Accessibility: [YOUR_SCORE]/100\n- Best Practices: [YOUR_SCORE]/100\n- SEO: [YOUR_SCORE]/100\n\nKey Issues:\n[PASTE TOP 3-5 ISSUES FROM REPORT]\n\nProvide:\n1. What these scores mean\n2. Priority fixes\n3. Quick wins (< 1 hour)\n4. Impact on user experience`;
                    navigator.clipboard.writeText(prompt);
                  }}
                >
                  📋 Copy Prompt
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Trends Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Google Trends</CardTitle>
              <CardDescription>Keyword trends and popularity</CardDescription>
            </div>
            {trendsData && <CheckCircle className="h-5 w-5 text-green-500" />}
            {trendsError && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => {
              // Extract keywords from URL or use default
              const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
              runTrends([domain, 'consulting', 'services']);
            }}
            disabled={trendsRunning || !!trendsData}
            className="w-full"
          >
            {trendsRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Trends...
              </>
            ) : trendsData ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Trends Complete
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Analyze Trends
              </>
            )}
          </Button>

          {trendsData && (
            <div className="space-y-2 text-sm">
              {trendsData.trends.map((trend: any, i: number) => (
                <div key={i} className="p-2 border rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{trend.keyword}</span>
                    <Badge variant={trend.trend === 'up' ? 'default' : trend.trend === 'down' ? 'destructive' : 'outline'}>
                      {trend.trend === 'up' ? '📈 Trending Up' : trend.trend === 'down' ? '📉 Trending Down' : '➡️ Stable'}
                    </Badge>
                  </div>
                  {trend.currentInterest && (
                    <div className="text-muted-foreground mt-1">
                      Interest: {trend.currentInterest}/100
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {trendsError && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded text-sm text-red-900 dark:text-red-100">
                ❌ Automated failed: {trendsError}
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ✋ Manual Fallback - Use This Instead:
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 mb-3">
                  <li>1. Go to: <a href="https://trends.google.com/trends/" target="_blank" rel="noopener noreferrer" className="underline font-mono">https://trends.google.com/trends/</a></li>
                  <li>2. Enter your main keywords</li>
                  <li>3. Set region and time range (Past 12 months)</li>
                  <li>4. Note the trends and related queries</li>
                  <li>5. Paste into Gemini with this prompt:</li>
                </ol>
                <div className="bg-white dark:bg-gray-900 p-3 rounded border text-xs">
                  <pre className="whitespace-pre-wrap">
{`Analyze Google Trends data for my keywords:

Main Keywords Analyzed:
1. [KEYWORD 1]
2. [KEYWORD 2]
3. [KEYWORD 3]

Trends (Past 12 months):
- [KEYWORD]: [Trending Up/Down/Stable] - Interest score: [0-100]

Related Queries (Rising):
1. [QUERY] - [Breakout/+X%]
2. [QUERY] - [Breakout/+X%]

Top Related Queries:
1. [QUERY]
2. [QUERY]

Provide:
1. Keyword trend analysis
2. Content opportunities from rising queries
3. Seasonal patterns
4. Recommended focus keywords`}
                  </pre>
                </div>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    const prompt = `Analyze Google Trends data for my keywords:\n\nMain Keywords Analyzed:\n1. [KEYWORD 1]\n2. [KEYWORD 2]\n\nTrends (Past 12 months):\n- [KEYWORD]: [Trending Up/Down/Stable] - Interest score: [0-100]\n\nRelated Queries (Rising):\n1. [QUERY] - [Breakout/+X%]\n\nProvide:\n1. Keyword trend analysis\n2. Content opportunities\n3. Seasonal patterns\n4. Recommended focus keywords`;
                    navigator.clipboard.writeText(prompt);
                  }}
                >
                  📋 Copy Prompt
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Tools Note */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Search Console, Analytics & Keyword Planner</strong> require manual setup (OAuth authentication).
            See <code className="text-xs">MANUAL_GOOGLE_TOOLS_PROMPTS.md</code> for copy/paste prompts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

