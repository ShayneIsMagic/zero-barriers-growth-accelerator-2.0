'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownReportGenerator } from '@/lib/markdown-report-generator';
import { Check, Copy, Download, Loader2, Target } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function StandaloneGoldenCirclePage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/golden-circle-standalone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, itemName: string) => {
    setIsCopying(true);
    setCopiedItem(itemName);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!', {
        description: `${itemName} has been copied to your clipboard.`,
        duration: 2000,
      });
    } catch (error) {
      toast.error('Copy failed', {
        description: 'Unable to copy to clipboard. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsCopying(false);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const downloadMarkdown = async () => {
    if (!result) return;

    setIsDownloading(true);
    try {
      const markdown = MarkdownReportGenerator.generateGoldenCircleReport(result.data, url);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `golden-circle-analysis-${url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success('Report downloaded successfully!', {
        description: 'Your Golden Circle analysis report has been saved.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Download failed', {
        description: 'There was an error downloading the report. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;

    const markdown = generateGoldenCircleMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golden-circle-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            Golden Circle Analysis
          </CardTitle>
          <CardDescription>
            Analyze your website's WHY, HOW, WHAT, and WHO using Simon Sinek's Golden Circle framework.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input */}
          <div>
            <label htmlFor="website-url" className="text-sm font-medium mb-2 block">
              Website URL
            </label>
            <Input
              id="website-url"
              name="website-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              aria-label="Enter website URL to analyze"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Analyze Button */}
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || !url.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Golden Circle...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze Golden Circle
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="why">WHY</TabsTrigger>
            <TabsTrigger value="how">HOW</TabsTrigger>
            <TabsTrigger value="what">WHAT</TabsTrigger>
            <TabsTrigger value="who">WHO</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Golden Circle Analysis Results</CardTitle>
                    <CardDescription>Overall assessment of your website's Golden Circle alignment</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2), 'Analysis Results')}
                      variant="outline"
                      size="sm"
                      disabled={isCopying}
                    >
                      {copiedItem === 'Analysis Results' ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copiedItem === 'Analysis Results' ? 'Copied!' : 'Copy Data'}
                    </Button>
                    <Button
                      onClick={downloadMarkdown}
                      variant="outline"
                      size="sm"
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {isDownloading ? 'Downloading...' : 'Download Report'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.data.overall_score}/100</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{result.data.alignment_score}/100</div>
                    <div className="text-sm text-muted-foreground">Alignment Score</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.data.clarity_score}/100</div>
                    <div className="text-sm text-muted-foreground">Clarity Score</div>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">WHY (Purpose)</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span>Clarity</span>
                        <Badge variant="outline">{result.data.why.clarity_rating}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.data.why.statement}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">HOW (Process)</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span>Uniqueness</span>
                        <Badge variant="outline">{result.data.how.uniqueness_rating}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.data.how.statement}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">WHAT (Products)</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span>Clarity</span>
                        <Badge variant="outline">{result.data.what.clarity_rating}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.data.what.statement}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">WHO (Audience)</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span>Specificity</span>
                        <Badge variant="outline">{result.data.who.specificity_rating}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.data.who.statement}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WHY Tab */}
          <TabsContent value="why">
            <Card>
              <CardHeader>
                <CardTitle>WHY - Purpose & Belief</CardTitle>
                <CardDescription>Your core purpose and what drives you beyond making money</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Your WHY Statement</h4>
                  <p className="text-sm">{result.data.why.statement}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.data.why.clarity_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Clarity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.data.why.authenticity_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Authenticity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.data.why.emotional_resonance_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Emotional Resonance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{result.data.why.differentiation_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Differentiation</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Evidence Found</h4>
                  <div className="space-y-2">
                    <div>
                      <strong>Citations:</strong> {result.data.why.evidence.citations.join(', ')}
                    </div>
                    <div>
                      <strong>Key Phrases:</strong> {result.data.why.evidence.key_phrases.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.data.why.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HOW Tab */}
          <TabsContent value="how">
            <Card>
              <CardHeader>
                <CardTitle>HOW - Unique Process/Approach</CardTitle>
                <CardDescription>Your unique methodology and what makes you different</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Your HOW Statement</h4>
                  <p className="text-sm">{result.data.how.statement}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.data.how.uniqueness_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Uniqueness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.data.how.clarity_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Clarity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.data.how.credibility_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Credibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{result.data.how.specificity_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Specificity</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Evidence Found</h4>
                  <div className="space-y-2">
                    <div>
                      <strong>Citations:</strong> {result.data.how.evidence.citations.join(', ')}
                    </div>
                    <div>
                      <strong>Key Phrases:</strong> {result.data.how.evidence.key_phrases.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.data.how.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WHAT Tab */}
          <TabsContent value="what">
            <Card>
              <CardHeader>
                <CardTitle>WHAT - Products/Services</CardTitle>
                <CardDescription>What you actually offer and how clearly it's communicated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Your WHAT Statement</h4>
                  <p className="text-sm">{result.data.what.statement}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.data.what.clarity_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Clarity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.data.what.completeness_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.data.what.value_articulation_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Value Articulation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{result.data.what.cta_clarity_rating}/10</div>
                    <div className="text-sm text-muted-foreground">CTA Clarity</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Evidence Found</h4>
                  <div className="space-y-2">
                    <div>
                      <strong>Citations:</strong> {result.data.what.evidence.citations.join(', ')}
                    </div>
                    <div>
                      <strong>Key Phrases:</strong> {result.data.what.evidence.key_phrases.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.data.what.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WHO Tab */}
          <TabsContent value="who">
            <Card>
              <CardHeader>
                <CardTitle>WHO - Target Audience</CardTitle>
                <CardDescription>Who your ideal customers are and how well you connect with them</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Your WHO Statement</h4>
                  <p className="text-sm">{result.data.who.statement}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.data.who.specificity_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Specificity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.data.who.resonance_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Resonance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.data.who.accessibility_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Accessibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{result.data.who.conversion_path_rating}/10</div>
                    <div className="text-sm text-muted-foreground">Conversion Path</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Target Personas</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.data.who.target_personas.map((persona: string, i: number) => (
                      <Badge key={i} variant="outline">{persona}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Evidence Found</h4>
                  <div className="space-y-2">
                    <div>
                      <strong>Citations:</strong> {result.data.who.evidence.citations.join(', ')}
                    </div>
                    <div>
                      <strong>Key Phrases:</strong> {result.data.who.evidence.key_phrases.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.data.who.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function generateGoldenCircleMarkdown(result: any): string {
  return `# Golden Circle Analysis Report

**URL:** ${result.url}
**Date:** ${new Date().toLocaleString()}

---

## Overall Scores

- **Overall Score:** ${result.data.overall_score}/100
- **Alignment Score:** ${result.data.alignment_score}/100
- **Clarity Score:** ${result.data.clarity_score}/100

---

## WHY - Purpose & Belief

**Statement:** ${result.data.why.statement}

**Scores:**
- Clarity: ${result.data.why.clarity_rating}/10
- Authenticity: ${result.data.why.authenticity_rating}/10
- Emotional Resonance: ${result.data.why.emotional_resonance_rating}/10
- Differentiation: ${result.data.why.differentiation_rating}/10

**Evidence:**
- Citations: ${result.data.why.evidence.citations.join(', ')}
- Key Phrases: ${result.data.why.evidence.key_phrases.join(', ')}

**Recommendations:**
${result.data.why.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

## HOW - Unique Process/Approach

**Statement:** ${result.data.how.statement}

**Scores:**
- Uniqueness: ${result.data.how.uniqueness_rating}/10
- Clarity: ${result.data.how.clarity_rating}/10
- Credibility: ${result.data.how.credibility_rating}/10
- Specificity: ${result.data.how.specificity_rating}/10

**Evidence:**
- Citations: ${result.data.how.evidence.citations.join(', ')}
- Key Phrases: ${result.data.how.evidence.key_phrases.join(', ')}

**Recommendations:**
${result.data.how.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

## WHAT - Products/Services

**Statement:** ${result.data.what.statement}

**Scores:**
- Clarity: ${result.data.what.clarity_rating}/10
- Completeness: ${result.data.what.completeness_rating}/10
- Value Articulation: ${result.data.what.value_articulation_rating}/10
- CTA Clarity: ${result.data.what.cta_clarity_rating}/10

**Evidence:**
- Citations: ${result.data.what.evidence.citations.join(', ')}
- Key Phrases: ${result.data.what.evidence.key_phrases.join(', ')}

**Recommendations:**
${result.data.what.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

## WHO - Target Audience

**Statement:** ${result.data.who.statement}

**Target Personas:** ${result.data.who.target_personas.join(', ')}

**Scores:**
- Specificity: ${result.data.who.specificity_rating}/10
- Resonance: ${result.data.who.resonance_rating}/10
- Accessibility: ${result.data.who.accessibility_rating}/10
- Conversion Path: ${result.data.who.conversion_path_rating}/10

**Evidence:**
- Citations: ${result.data.who.evidence.citations.join(', ')}
- Key Phrases: ${result.data.who.evidence.key_phrases.join(', ')}

**Recommendations:**
${result.data.who.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

Generated by Zero Barriers Growth Accelerator
`;
}
