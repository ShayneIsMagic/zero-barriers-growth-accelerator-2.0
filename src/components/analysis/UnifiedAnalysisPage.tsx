'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  Brain, 
  CheckCircle, 
  Loader2, 
  Target, 
  TrendingUp, 
  Users, 
  X,
  Zap
} from 'lucide-react';

interface AnalysisOptions {
  includeGoldenCircle?: boolean;
  includeElementsValueB2C?: boolean;
  includeElementsValueB2B?: boolean;
  includeCliftonStrengths?: boolean;
}

interface UnifiedAnalysisResult {
  success: boolean;
  url: string;
  scrapedData: any;
  analyses: {
    goldenCircle?: any;
    elementsValueB2C?: any;
    elementsValueB2B?: any;
    cliftonStrengths?: any;
  };
  errors: { [key: string]: string };
  completedAnalyses: string[];
  failedAnalyses: string[];
}

export function UnifiedAnalysisPage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [options, setOptions] = useState<AnalysisOptions>({
    includeGoldenCircle: true,
    includeElementsValueB2C: true,
    includeElementsValueB2B: true,
    includeCliftonStrengths: true
  });
  const [result, setResult] = useState<UnifiedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, options }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptionChange = (option: keyof AnalysisOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const getAnalysisIcon = (analysisType: string) => {
    switch (analysisType) {
      case 'goldenCircle': return <Target className="h-4 w-4" />;
      case 'elementsValueB2C': return <Users className="h-4 w-4" />;
      case 'elementsValueB2B': return <BarChart3 className="h-4 w-4" />;
      case 'cliftonStrengths': return <Brain className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getAnalysisName = (analysisType: string) => {
    switch (analysisType) {
      case 'goldenCircle': return 'Golden Circle Analysis';
      case 'elementsValueB2C': return 'B2C Elements of Value';
      case 'elementsValueB2B': return 'B2B Elements of Value';
      case 'cliftonStrengths': return 'CliftonStrengths Analysis';
      default: return analysisType;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Unified Analysis</h1>
        <p className="text-muted-foreground">
          Run multiple assessments from a single website scrape
        </p>
      </div>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle>Website Analysis</CardTitle>
          <CardDescription>
            Enter a website URL to run multiple analyses simultaneously
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              className="w-full"
            />
          </div>

          {/* Analysis Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Select Analyses to Run:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goldenCircle"
                  checked={options.includeGoldenCircle}
                  onCheckedChange={() => handleOptionChange('includeGoldenCircle')}
                  disabled={isAnalyzing}
                />
                <label htmlFor="goldenCircle" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Golden Circle</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="elementsValueB2C"
                  checked={options.includeElementsValueB2C}
                  onCheckedChange={() => handleOptionChange('includeElementsValueB2C')}
                  disabled={isAnalyzing}
                />
                <label htmlFor="elementsValueB2C" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>B2C Elements of Value</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="elementsValueB2B"
                  checked={options.includeElementsValueB2B}
                  onCheckedChange={() => handleOptionChange('includeElementsValueB2B')}
                  disabled={isAnalyzing}
                />
                <label htmlFor="elementsValueB2B" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>B2B Elements of Value</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cliftonStrengths"
                  checked={options.includeCliftonStrengths}
                  onCheckedChange={() => handleOptionChange('includeCliftonStrengths')}
                  disabled={isAnalyzing}
                />
                <label htmlFor="cliftonStrengths" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>CliftonStrengths</span>
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !url.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Multiple Analyses...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Run Unified Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <X className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Analysis Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.completedAnalyses.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {result.failedAnalyses.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.scrapedData?.cleanText?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((result.completedAnalyses.length / (result.completedAnalyses.length + result.failedAnalyses.length)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Analysis Results */}
          <div className="grid gap-6">
            {result.completedAnalyses.map((analysisType) => (
              <Card key={analysisType}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getAnalysisIcon(analysisType)}
                    <span>{getAnalysisName(analysisType)}</span>
                    <Badge variant="default" className="ml-auto">Completed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto max-h-64">
                      {JSON.stringify(result.analyses[analysisType as keyof typeof result.analyses], null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}

            {result.failedAnalyses.map((analysisType) => (
              <Card key={analysisType} className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getAnalysisIcon(analysisType)}
                    <span>{getAnalysisName(analysisType)}</span>
                    <Badge variant="destructive" className="ml-auto">Failed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-red-600">
                    {result.errors[analysisType] || 'Unknown error'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
