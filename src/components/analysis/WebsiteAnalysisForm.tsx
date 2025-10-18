'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AnalysisNotification, SiteIdentification } from '@/components/ui/analysis-notification';
import { Loader2, Globe, FileText, Share2, Settings, RefreshCw } from 'lucide-react';
import { AnalysisClient } from '@/lib/analysis-client';

interface WebsiteAnalysisFormProps {
  onAnalysisComplete: (result: any) => void;
}

export function WebsiteAnalysisForm({ onAnalysisComplete }: WebsiteAnalysisFormProps) {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [analysisType, setAnalysisType] = useState<'full' | 'quick' | 'social-media'>('full');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<{
    type: 'error' | 'info';
    title: string;
    message: string;
    details?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAnalyzing(true);

    try {
      // Use the working Phase 1 simple system
      const response = await fetch('/api/analyze/phase1-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _url,
          industry: 'general'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error types
        if (result.error === 'AI_SERVICE_UNAVAILABLE') {
          setError({
            type: 'error',
            title: 'AI Service Not Available',
            message: 'No AI services are configured. Please set up your API keys.',
            details: result.details,
            action: {
              label: 'Setup AI Services',
              onClick: () => {
                window.open('https://makersuite.google.com/app/apikey', '_blank');
              }
            }
          });
        } else if (result.error === 'WEBSITE_UNAVAILABLE') {
          setError({
            type: 'error',
            title: 'Website Not Accessible',
            message: 'Unable to access the website. Please check the URL.',
            details: result.details,
            action: {
              label: 'Try Again',
              onClick: () => setError(null)
            }
          });
        } else if (result.error === 'ANALYSIS_FAILED') {
          setError({
            type: 'error',
            title: 'Analysis Failed',
            message: 'AI analysis could not be completed. Please check your configuration.',
            details: result.details,
            action: {
              label: 'Check Configuration',
              onClick: () => {
                window.open('https://console.anthropic.com/', '_blank');
              }
            }
          });
        } else {
          setError({
            type: 'error',
            title: 'Analysis Error',
            message: result.message || 'An unexpected error occurred.',
            details: result.details,
            action: {
              label: 'Try Again',
              onClick: () => setError(null)
            }
          });
        }
        return;
      }

      // Success - Phase 1 data collection completed
      try {
        // Create analysis result for Phase 1
        const analysisForStorage = {
          id: `analysis-${Date.now()}`,
          url: result.url,
          overallScore: 0, // Placeholder, actual score comes from Phase 2
          summary: result.message || 'Phase 1 data collection completed',
          status: 'completed' as const,
          timestamp: new Date().toISOString(),
          goldenCircle: null,
          elementsOfValue: null,
          cliftonStrengths: null,
          recommendations: [],
          scrapedContent: result.data, // Store scraped content for Phase 2
          phase: 1
        };
        
        AnalysisClient.saveAnalysis(analysisForStorage);
        console.log('✅ Phase 1 data saved to localStorage');
        
        // Notify parent component
        onAnalysisComplete?.(analysisForStorage);
      } catch (saveError) {
        console.error('Failed to save Phase 1 data:', saveError);
      }
    } catch (err) {
      setError({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to the analysis service.',
        details: err instanceof Error ? err.message : 'Unknown error',
        action: {
          label: 'Try Again',
          onClick: () => setError(null)
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Website Analysis
        </CardTitle>
        <CardDescription>
          Analyze any website using the Zero Barriers Growth Accelerator framework
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Site Identification */}
        {url && (
          <div className="mb-6">
            <SiteIdentification url={url} isAnalyzing={isAnalyzing} />
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6">
            <AnalysisNotification
              type={error.type}
              title={error.title}
              message={error.message}
              details={error.details || ''}
              {...(error.action && { action: error.action })}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysisType">Analysis Type</Label>
            <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
              <SelectTrigger id="analysisType" name="analysisType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Full Analysis
                  </div>
                </SelectItem>
                <SelectItem value="quick">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Quick Assessment
                  </div>
                </SelectItem>
                <SelectItem value="social-media">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Social Media Focus
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Additional Content (Optional)</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Paste any specific content you'd like analyzed..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>


          <Button 
            type="submit" 
            className="w-full" 
            disabled={isAnalyzing || !url}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Website...
              </>
            ) : (
              'Analyze Website'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Analysis Includes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Simon Sinek&apos;s Golden Circle Analysis</li>
            <li>• Consumer Elements of Value Assessment</li>
            <li>• B2B Elements of Value Evaluation</li>
            <li>• CliftonStrengths Domains Analysis</li>
            <li>• Transformation Messaging Recommendations</li>
            <li>• Social Media Strategy Suggestions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}