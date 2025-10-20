'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle, Loader2, Play } from 'lucide-react';
import { useState } from 'react';
// ContentPreviewCard removed - using simple display instead
import { IndividualReportsView } from './IndividualReportsView';

export function PhasedAnalysisPage() {
  const [url, setUrl] = useState('');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phase1Reports, setPhase1Reports] = useState<any[]>([]);
  const [phase2Reports, setPhase2Reports] = useState<any[]>([]);
  const [phase3Reports, setPhase3Reports] = useState<any[]>([]);

  const [phase1Data, setPhase1Data] = useState<any>(null);
  const [phase2Data, setPhase2Data] = useState<any>(null);
  const [phase3Data, setPhase3Data] = useState<any>(null);

  const runPhase = async (phase: number) => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          phase,
          analysisId: analysisId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Phase execution failed');
      }

      if (data.success) {
        setAnalysisId(data.analysisId);
        setCurrentPhase(phase);

        if (phase === 1) {
          setPhase1Data(data.data);
          setPhase1Reports(data.individualReports || []);
        } else if (phase === 2) {
          setPhase2Data(data.data);
          setPhase2Reports(data.individualReports.filter((r: any) => r.phase === 'Phase 2'));

          // Show recommendations if Phase 1 was skipped
          if (data.recommendations && data.recommendations.length > 0) {
            setError(null); // Clear error
            // Recommendations will be shown in the reports
          }
        } else if (phase === 3) {
          setPhase3Data(data.data);
          setPhase3Reports(data.individualReports.filter((r: any) => r.phase === 'Phase 3'));

          // Show recommendations if prior phases were skipped
          if (data.recommendations && data.recommendations.length > 0) {
            setError(null);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run phase');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Phased Website Analysis</CardTitle>
          <CardDescription>
            Run each phase separately. Review results before proceeding to the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={currentPhase > 0}
              className="flex-1"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Phase Progress */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {/* Phase 1 */}
            <Card className={currentPhase >= 1 ? 'border-green-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Phase 1</CardTitle>
                  {currentPhase >= 1 && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <CardDescription>Data Collection</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground mb-3">
                  <li>• Collect website content & metadata</li>
                  <li>• Extract keywords & topics</li>
                  <li>• Prepare data for AI analysis</li>
                </ul>
                <Button
                  onClick={() => runPhase(1)}
                  disabled={!url.trim() || isRunning || currentPhase >= 1}
                  className="w-full"
                >
                  {isRunning && currentPhase === 0 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : currentPhase >= 1 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Phase 1
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className={currentPhase >= 2 ? 'border-green-500' : currentPhase === 1 ? 'border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Phase 2</CardTitle>
                  {currentPhase >= 2 && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <CardDescription>Framework Analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground mb-3">
                  <li>• Golden Circle (Gemini AI)</li>
                  <li>• Elements of Value (Gemini AI)</li>
                  <li>• B2B Elements (Gemini AI)</li>
                  <li>• CliftonStrengths (Gemini AI)</li>
                </ul>
                {currentPhase === 1 && (
                  <div className="mb-3 p-2 bg-green-50 dark:bg-green-950 border border-green-200 rounded text-xs text-green-800 dark:text-green-200">
                    ✅ Ready! Will analyze content from Phase 1
                  </div>
                )}
                <Button
                  onClick={() => runPhase(2)}
                  disabled={isRunning || currentPhase >= 2}
                  className="w-full"
                  variant={currentPhase === 1 ? 'default' : 'outline'}
                >
                  {isRunning && currentPhase === 1 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : currentPhase >= 2 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </>
                  ) : currentPhase === 1 ? (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Start Phase 2
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Phase 2 (Standalone)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Phase 3 */}
            <Card className={currentPhase >= 3 ? 'border-green-500' : currentPhase === 2 ? 'border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Phase 3</CardTitle>
                  {currentPhase >= 3 && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <CardDescription>Strategic Analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground mb-3">
                  <li>• Comprehensive insights (Gemini AI)</li>
                  <li>• Priority recommendations</li>
                  <li>• Quick wins & long-term strategy</li>
                </ul>
                <Button
                  onClick={() => runPhase(3)}
                  disabled={currentPhase < 2 || isRunning || currentPhase >= 3}
                  className="w-full"
                  variant={currentPhase === 2 ? 'default' : 'outline'}
                >
                  {isRunning && currentPhase === 2 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : currentPhase >= 3 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </>
                  ) : currentPhase === 2 ? (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Start Phase 3
                    </>
                  ) : (
                    'Complete Phase 2 First'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Phase 1 Results */}
      {phase1Reports.length > 0 && (
        <>
          {/* Content Preview - Show What Was Collected */}
          {phase1Data?.scrapedContent && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-900 dark:text-blue-100">
                      ✅ Content Successfully Collected
                    </CardTitle>
                    <CardDescription>
                      Review the content, meta tags, and keywords we extracted. This is what AI will analyze in Phase 2.
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="bg-blue-500">
                    Foundation Data
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Title:</h4>
                    <p className="text-sm text-muted-foreground">{phase1Data.scrapedContent.title || 'No title found'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Meta Description:</h4>
                    <p className="text-sm text-muted-foreground">{phase1Data.scrapedContent.metaDescription || 'No meta description found'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Keywords:</h4>
                    <p className="text-sm text-muted-foreground">{phase1Data.scrapedContent.extractedKeywords?.join(', ') || 'No keywords found'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content Preview:</h4>
                    <p className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                      {phase1Data.scrapedContent.cleanText?.substring(0, 500) || 'No content found'}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Phase 1: Data Collection Reports</CardTitle>
                  <CardDescription>
                    {phase1Reports.length} reports • Download individually or all at once
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-green-500">
                  ✓ Phase 1 Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <IndividualReportsView reports={phase1Reports} url={url} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Phase 2 Results */}
      {phase2Reports.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Phase 2: Framework Analysis Results</CardTitle>
                <CardDescription>
                  {phase2Reports.length} AI-powered framework analyses
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500">
                ✓ Phase 2 Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <IndividualReportsView reports={phase2Reports} url={url} />
          </CardContent>
        </Card>
      )}

      {/* Phase 3 Results */}
      {phase3Reports.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Phase 3: Strategic Analysis Results</CardTitle>
                <CardDescription>
                  Comprehensive insights and recommendations
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500">
                ✓ Phase 3 Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <IndividualReportsView reports={phase3Reports} url={url} />

            {phase3Data && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  🎉 All Phases Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Your comprehensive website analysis is ready. You have {phase1Reports.length + phase2Reports.length + phase3Reports.length} individual reports to review.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    // Download all reports logic
                    [...phase1Reports, ...phase2Reports, ...phase3Reports].forEach(report => {
                      const blob = new Blob([report.markdown], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${report.id}-${new Date().toISOString().split('T')[0]}.md`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    });
                  }}>
                    Download All Reports
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

