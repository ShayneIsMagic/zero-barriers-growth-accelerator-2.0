'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, FileText, Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { PageAnalysisResult } from '@/lib/page-analyzer';

interface PageAnalysisFormProps {
  onAnalysisComplete?: (result: PageAnalysisResult) => void;
}

export function PageAnalysisForm({ onAnalysisComplete }: PageAnalysisFormProps) {
  const [url, setUrl] = useState('');
  const [pageType, setPageType] = useState<'home' | 'testimonials' | 'services' | 'about' | 'contact' | 'case-studies' | 'general'>('general');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysis, setAnalysis] = useState<PageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setAnalysis(null);

    try {
      // Step 1: Scraping page content
      setCurrentStep('Scraping page content...');
      setProgress(20);

      // Step 2: Analyzing with AI
      setCurrentStep('Analyzing with AI...');
      setProgress(40);

      const response = await fetch('/api/analyze/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          pageType,
          deepAnalysis: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Analysis failed');
      }

      // Step 3: Processing results
      setCurrentStep('Processing results...');
      setProgress(80);

      const data = await response.json();
      const result = data.analysis as PageAnalysisResult;

      // Step 4: Complete
      setCurrentStep('Analysis complete!');
      setProgress(100);

      setAnalysis(result);
      onAnalysisComplete?.(result);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      setCurrentStep('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysis }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF download error:', err);
      setError('Failed to generate PDF');
    }
  };

  const getPageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      home: 'bg-blue-100 text-blue-800',
      testimonials: 'bg-green-100 text-green-800',
      services: 'bg-purple-100 text-purple-800',
      about: 'bg-orange-100 text-orange-800',
      contact: 'bg-red-100 text-red-800',
      'case-studies': 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Page Analysis
          </CardTitle>
          <CardDescription>
            Analyze individual pages with specialized AI prompts for comprehensive insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageType">Page Type</Label>
            <Select value={pageType} onValueChange={(value: any) => setPageType(value)} disabled={isAnalyzing}>
              <SelectTrigger>
                <SelectValue placeholder="Select page type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home Page</SelectItem>
                <SelectItem value="testimonials">Testimonials</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="about">About Us</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="case-studies">Case Studies</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !url.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Page
              </>
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{currentStep}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Analysis Complete
                </CardTitle>
                <CardDescription>
                  Analysis of {analysis.url} ({analysis.pageType} page)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPageTypeColor(analysis.pageType)}>
                  {analysis.pageType}
                </Badge>
                <Button onClick={handleDownloadPDF} size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.overallScore}</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.goldenCircle.overallScore}</div>
                <div className="text-sm text-muted-foreground">Golden Circle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.elementsOfValue.overallScore}</div>
                <div className="text-sm text-muted-foreground">Elements of Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analysis.cliftonStrengths.overallScore}</div>
                <div className="text-sm text-muted-foreground">CliftonStrengths</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Analysis Time: {analysis.loadingTime}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Words: {analysis.wordCount?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>Links: {analysis.linkCount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Golden Circle Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Why:</strong> {analysis.goldenCircle.why.statement}</div>
                  <div><strong>How:</strong> {analysis.goldenCircle.how.methodology}</div>
                  <div><strong>What:</strong> {analysis.goldenCircle.what.offerings.join(', ')}</div>
                  <div><strong>Who:</strong> {analysis.goldenCircle.who.targetAudience}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Page-Specific Insights</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Analysis:</strong> {analysis.specificInsights.pageSpecificAnalysis}</div>
                  <div><strong>CTAs:</strong> {analysis.specificInsights.callToActions.join(', ')}</div>
                  <div><strong>Trust Signals:</strong> {analysis.specificInsights.trustSignals.join(', ')}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>High Priority:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      {analysis.recommendations.highPriority.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span>{rec.title}: {rec.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Medium Priority:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      {analysis.recommendations.mediumPriority.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{rec.title}: {rec.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Low Priority:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      {analysis.recommendations.lowPriority.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{rec.title}: {rec.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
