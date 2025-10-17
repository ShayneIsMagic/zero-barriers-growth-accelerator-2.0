/**
 * Claude Project Test Page
 * Demonstrates the Claude project integration system
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    BarChart3,
    Bot,
    Brain,
    CheckCircle,
    ExternalLink,
    Loader2,
    Target,
    Users,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { ContentPreviewBox } from './ContentPreviewBox';

interface ClaudeAnalysisResult {
  success: boolean;
  url: string;
  assessmentType: string;
  clientId: string;
  sessionId: string;
  claudeChatUrl?: string;
  analysis?: any;
  error?: string;
  timestamp: string;
  projectUrl: string;
}

export function ClaudeProjectTestPage() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<any>(null);
  const [selectedAssessment, setSelectedAssessment] = useState('golden-circle');
  const [result, setResult] = useState<ClaudeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assessmentTypes = [
    { id: 'golden-circle', name: 'Golden Circle Analysis', icon: Target, color: 'blue' },
    { id: 'elements-value-b2c', name: 'B2C Elements of Value', icon: Users, color: 'green' },
    { id: 'elements-value-b2b', name: 'B2B Elements of Value', icon: BarChart3, color: 'purple' },
    { id: 'clifton-strengths', name: 'CliftonStrengths Analysis', icon: Brain, color: 'orange' },
    { id: 'content-comparison', name: 'Content Comparison', icon: Zap, color: 'red' }
  ];

  const handleScrapeContent = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsScraping(true);
    setError(null);
    setScrapedContent(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setScrapedContent(data.data);
        console.log('✅ Content scraped successfully');
      } else {
        throw new Error(data.error || 'Failed to scrape content');
      }
    } catch (error) {
      console.error('❌ Content scraping failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to scrape content');
    } finally {
      setIsScraping(false);
    }
  };

  const handleAnalyzeWithClaude = async () => {
    if (!scrapedContent) {
      setError('Please scrape content first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/claude-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          scrapedData: scrapedContent,
          assessmentType: selectedAssessment
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        console.log('✅ Claude project analysis completed');
      } else {
        throw new Error(data.error || 'Claude analysis failed');
      }
    } catch (error) {
      console.error('❌ Claude analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAssessmentIcon = (assessmentId: string) => {
    const assessment = assessmentTypes.find(a => a.id === assessmentId);
    return assessment ? assessment.icon : Brain;
  };

  const getAssessmentColor = (assessmentId: string) => {
    const assessment = assessmentTypes.find(a => a.id === assessmentId);
    return assessment ? assessment.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Claude Project Integration Test
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Test the Claude project integration system with fresh client sessions
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="text-sm">
              Project: Zero Barriers Growth Accelerator
            </Badge>
          </div>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6 text-blue-600" />
              Create Fresh Claude Session
            </CardTitle>
            <CardDescription>
              Each client gets a unique Claude chat session within the project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                name="website-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScraping || isAnalyzing}
                aria-label="Enter website URL to analyze"
                aria-describedby="url-help"
                required
              />
              <p id="url-help" className="text-xs text-muted-foreground mt-1">
                Enter the URL of the website you want to analyze
              </p>
            </div>

            <div>
              <Label htmlFor="assessment-type">Assessment Type</Label>
              <select
                id="assessment-type"
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isScraping || isAnalyzing}
              >
                {assessmentTypes.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleScrapeContent}
                disabled={isScraping || !url.trim()}
                className="flex-1"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping Content...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Step 1: Scrape Content
                  </>
                )}
              </Button>

              <Button
                onClick={handleAnalyzeWithClaude}
                disabled={isAnalyzing || !scrapedContent}
                className="flex-1"
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with Claude...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Step 2: Claude Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Scraped Content Preview */}
        {scrapedContent && (
          <ContentPreviewBox
            scrapedContent={scrapedContent}
            url={url}
            title="Claude Project Analysis - Scraped Content Preview"
            description="Content successfully scraped from the website. Review the data before running Claude analysis."
          />
        )}

        {/* Claude Analysis Results */}
        {result && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle>Claude Project Analysis Results</CardTitle>
                    <CardDescription>
                      Analysis completed using fresh Claude session
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(result.claudeChatUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    disabled={!result.claudeChatUrl}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Claude Chat
                  </Button>
                  <Button
                    onClick={() => window.open(result.projectUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Session Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Client ID</p>
                    <p className="text-lg font-semibold">{result.clientId}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Session ID</p>
                    <p className="text-lg font-semibold font-mono text-xs">{result.sessionId}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assessment</p>
                    <div className="flex items-center">
                      {React.createElement(getAssessmentIcon(selectedAssessment), {
                        className: `h-5 w-5 text-${getAssessmentColor(selectedAssessment)}-600 mr-2`
                      })}
                      <span className="text-lg font-semibold">
                        {assessmentTypes.find(a => a.id === selectedAssessment)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <h4 className="font-semibold mb-2">Analysis Results</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {JSON.stringify(result.analysis, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Project Links */}
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <h4 className="font-semibold mb-2">Claude Project Links</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Project URL:</span>
                      <Button
                        onClick={() => window.open(result.projectUrl, '_blank')}
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                      >
                        {result.projectUrl}
                      </Button>
                    </div>
                    {result.claudeChatUrl && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Chat URL:</span>
                        <Button
                          onClick={() => window.open(result.claudeChatUrl, '_blank')}
                          variant="link"
                          size="sm"
                          className="p-0 h-auto"
                        >
                          {result.claudeChatUrl}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
