/**
 * Standalone B2C Elements of Value Analysis Page
 * Uses unified data collection and results viewing
 */

'use client';

import { useState } from 'react';
import { UnifiedDataCollection } from './UnifiedDataCollection';
import { AssessmentResultsView } from './AssessmentResultsView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ArrowRight,
  Target
} from 'lucide-react';

interface CollectedData {
  url: string;
  title: string;
  metaDescription: string;
  cleanText: string;
  headings: string[];
  images: Array<{ src: string; alt: string }>;
  links: Array<{ href: string; text: string }>;
  metadata: any;
  technical: any;
  scrapedAt: string;
}

export function StandaloneElementsOfValueB2CPage() {
  const [collectedData, setCollectedData] = useState<CollectedData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'collect' | 'analyze' | 'results'>('collect');

  const handleDataCollected = (data: CollectedData | null) => {
    setCollectedData(data);
    if (data) {
      setStep('analyze');
    }
  };

  const handleAnalyze = async () => {
    if (!collectedData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/elements-value-b2c-standalone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: collectedData.url,
          scrapedContent: collectedData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'B2C Elements analysis failed');
      }

      if (data.success) {
        setAnalysisResult(data.data);
        setStep('results');
      } else {
        throw new Error(data.error || 'B2C Elements analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'B2C Elements analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (collectedData) {
      handleAnalyze();
    }
  };

  const handleNewAnalysis = () => {
    setCollectedData(null);
    setAnalysisResult(null);
    setError(null);
    setStep('collect');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            B2C Elements of Value Analysis
          </CardTitle>
          <CardDescription>
            Analyze your website using the 30 B2C Elements of Value framework to identify revenue opportunities and customer satisfaction improvements.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Step 1: Data Collection */}
      {step === 'collect' && (
        <UnifiedDataCollection
          onDataCollected={handleDataCollected}
          showDataPreview={true}
        />
      )}

      {/* Step 2: Analysis */}
      {step === 'analyze' && collectedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Ready to Analyze
            </CardTitle>
            <CardDescription>
              Data collected successfully. Click below to run the B2C Elements of Value analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Data Ready</span>
                </div>
                <p className="text-sm text-green-700">
                  {collectedData.cleanText.length} characters collected from {collectedData.url}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing B2C Elements...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Run B2C Analysis
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleNewAnalysis}>
                  Start Over
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <Button variant="outline" onClick={handleNewAnalysis}>
              New Analysis
            </Button>
          </div>
          
          <AssessmentResultsView
            assessmentType="b2c-elements"
            data={analysisResult}
            isLoading={isAnalyzing}
            error={error}
            onRetry={handleRetry}
            showRawData={true}
          />
        </div>
      )}
    </div>
  );
}