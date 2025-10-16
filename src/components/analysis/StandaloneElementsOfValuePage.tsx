'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, Star } from 'lucide-react';
import { useState } from 'react';

export function StandaloneElementsOfValuePage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/elements-value-standalone', {
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

  const downloadReport = () => {
    if (!result) return;

    const markdown = generateElementsOfValueMarkdown(result);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elements-of-value-analysis-${new Date().toISOString().split('T')[0]}.md`;
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
            <Star className="h-6 w-6" />
            Elements of Value Analysis
          </CardTitle>
          <CardDescription>
            Analyze your website's value elements using Bain & Company's B2C and B2B frameworks.
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
                Analyzing Elements of Value...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Analyze Elements of Value
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="b2c">B2C Elements (30)</TabsTrigger>
            <TabsTrigger value="b2b">B2B Elements (40)</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Elements of Value Analysis Results</CardTitle>
                    <CardDescription>Overall assessment of your website's value elements</CardDescription>
                  </div>
                  <Button onClick={downloadReport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* B2C Scores */}
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">B2C Elements of Value (30 Elements)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{result.data.b2c.overall_score}/100</div>
                      <div className="text-sm text-muted-foreground">Overall</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{result.data.b2c.functional_score}/100</div>
                      <div className="text-sm text-muted-foreground">Functional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{result.data.b2c.emotional_score}/100</div>
                      <div className="text-sm text-muted-foreground">Emotional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{result.data.b2c.life_changing_score}/100</div>
                      <div className="text-sm text-muted-foreground">Life Changing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{result.data.b2c.social_impact_score}/100</div>
                      <div className="text-sm text-muted-foreground">Social Impact</div>
                    </div>
                  </div>
                </div>

                {/* B2B Scores */}
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">B2B Elements of Value (40 Elements)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{result.data.b2b.overall_score}/100</div>
                      <div className="text-sm text-muted-foreground">Overall</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{result.data.b2b.table_stakes_score}/100</div>
                      <div className="text-sm text-muted-foreground">Table Stakes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{result.data.b2b.functional_score}/100</div>
                      <div className="text-sm text-muted-foreground">Functional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{result.data.b2b.ease_of_doing_business_score}/100</div>
                      <div className="text-sm text-muted-foreground">Ease of Business</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{result.data.b2b.individual_score}/100</div>
                      <div className="text-sm text-muted-foreground">Individual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">{result.data.b2b.inspirational_score}/100</div>
                      <div className="text-sm text-muted-foreground">Inspirational</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* B2C Tab */}
          <TabsContent value="b2c">
            <Card>
              <CardHeader>
                <CardTitle>B2C Elements of Value (30 Elements)</CardTitle>
                <CardDescription>Consumer-focused value elements that drive customer satisfaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(result.data.b2c.elements).map(([element, data]: [string, any]) => (
                    <div key={element} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">{element.replace(/_/g, ' ')}</h4>
                        <Badge variant={data.present ? "default" : "secondary"}>
                          {data.present ? `${data.strength}/10` : 'Not Present'}
                        </Badge>
                      </div>
                      {data.present && data.evidence.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Evidence:</strong> {data.evidence.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-2">B2C Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.data.b2c.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* B2B Tab */}
          <TabsContent value="b2b">
            <Card>
              <CardHeader>
                <CardTitle>B2B Elements of Value (40 Elements)</CardTitle>
                <CardDescription>Business-focused value elements that drive B2B success</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(result.data.b2b.elements).map(([element, data]: [string, any]) => (
                    <div key={element} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">{element.replace(/_/g, ' ')}</h4>
                        <Badge variant={data.present ? "default" : "secondary"}>
                          {data.present ? `${data.strength}/10` : 'Not Present'}
                        </Badge>
                      </div>
                      {data.present && data.evidence.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Evidence:</strong> {data.evidence.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold mb-2">B2B Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.data.b2b.recommendations.map((rec: string, i: number) => (
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

function generateElementsOfValueMarkdown(result: any): string {
  return `# Elements of Value Analysis Report

**URL:** ${result.url}
**Date:** ${new Date().toLocaleString()}

---

## B2C Elements of Value (30 Elements)

**Overall Score:** ${result.data.b2c.overall_score}/100

### Category Scores:
- **Functional:** ${result.data.b2c.functional_score}/100
- **Emotional:** ${result.data.b2c.emotional_score}/100
- **Life Changing:** ${result.data.b2c.life_changing_score}/100
- **Social Impact:** ${result.data.b2c.social_impact_score}/100

### Elements Analysis:
${Object.entries(result.data.b2c.elements).map(([element, data]: [string, any]) => 
  `**${element.replace(/_/g, ' ').toUpperCase()}:** ${data.present ? `${data.strength}/10` : 'Not Present'}${data.evidence.length > 0 ? ` - Evidence: ${data.evidence.join(', ')}` : ''}`
).join('\n')}

### B2C Recommendations:
${result.data.b2c.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

## B2B Elements of Value (40 Elements)

**Overall Score:** ${result.data.b2b.overall_score}/100

### Category Scores:
- **Table Stakes:** ${result.data.b2b.table_stakes_score}/100
- **Functional:** ${result.data.b2b.functional_score}/100
- **Ease of Doing Business:** ${result.data.b2b.ease_of_doing_business_score}/100
- **Individual:** ${result.data.b2b.individual_score}/100
- **Inspirational:** ${result.data.b2b.inspirational_score}/100

### Elements Analysis:
${Object.entries(result.data.b2b.elements).map(([element, data]: [string, any]) => 
  `**${element.replace(/_/g, ' ').toUpperCase()}:** ${data.present ? `${data.strength}/10` : 'Not Present'}${data.evidence.length > 0 ? ` - Evidence: ${data.evidence.join(', ')}` : ''}`
).join('\n')}

### B2B Recommendations:
${result.data.b2b.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

Generated by Zero Barriers Growth Accelerator
`;
}
