'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Download, 
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Brain,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

interface AssessmentResultsViewProps {
  assessmentType: 'b2c-elements' | 'b2b-elements' | 'golden-circle' | 'clifton-strengths' | 'content-comparison';
  data: any;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  showRawData?: boolean;
}

const ASSESSMENT_CONFIG = {
  'b2c-elements': {
    title: 'B2C Elements of Value Analysis',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  'b2b-elements': {
    title: 'B2B Elements of Value Analysis',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  'golden-circle': {
    title: 'Golden Circle Analysis',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  'clifton-strengths': {
    title: 'CliftonStrengths Analysis',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  'content-comparison': {
    title: 'Content Comparison Analysis',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
};

export function AssessmentResultsView({ 
  assessmentType, 
  data, 
  isLoading, 
  error, 
  onRetry,
  showRawData = false 
}: AssessmentResultsViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const config = ASSESSMENT_CONFIG[assessmentType];
  const IconComponent = config.icon;

  const handleCopyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Results copied to clipboard');
  };

  const handleDownloadResults = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assessmentType}-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Results downloaded');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className={`${config.borderColor} ${config.bgColor}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Running {config.title}...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Analysis Failed
          </CardTitle>
          <CardDescription>
            {config.title} encountered an error
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Analysis
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <IconComponent className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No analysis data available</p>
            <p className="text-sm text-gray-500 mt-2">Run an analysis to see results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${config.borderColor} ${config.bgColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${config.color}`} />
            <div>
              <CardTitle className={config.color}>{config.title}</CardTitle>
              <CardDescription>
                Analysis completed successfully
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyResults}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadResults}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {showRawData && <TabsTrigger value="raw">Raw Data</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderOverview(data, assessmentType, getScoreColor, getScoreBadgeVariant)}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {renderDetails(data, assessmentType, getScoreColor, getScoreBadgeVariant)}
          </TabsContent>

          {showRawData && (
            <TabsContent value="raw" className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function renderOverview(data: any, assessmentType: string, getScoreColor: (score: number) => string, getScoreBadgeVariant: (score: number) => string) {
  switch (assessmentType) {
    case 'b2c-elements':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(data.overall_score || 0)}`}>
                {data.overall_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(data.functional_score || 0)}`}>
                {data.functional_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Functional</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(data.emotional_score || 0)}`}>
                {data.emotional_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Emotional</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(data.life_changing_score || 0)}`}>
                {data.life_changing_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Life-Changing</div>
            </div>
          </div>

          {data.revenue_opportunities && data.revenue_opportunities.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Top Revenue Opportunities</h4>
              <div className="space-y-2">
                {data.revenue_opportunities.slice(0, 3).map((opp: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{opp.element}</span>
                    <Badge variant={getScoreBadgeVariant(opp.current_strength)}>
                      {opp.current_strength}/10
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'b2b-elements':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(data.overall_score || 0)}`}>
                {data.overall_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(data.table_stakes_score || 0)}`}>
                {data.table_stakes_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Table Stakes</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(data.functional_score || 0)}`}>
                {data.functional_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Functional</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(data.ease_of_business_score || 0)}`}>
                {data.ease_of_business_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Ease of Business</div>
            </div>
          </div>
        </div>
      );

    case 'golden-circle':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded border">
              <h4 className="font-semibold text-purple-600 mb-2">Why</h4>
              <p className="text-sm text-gray-600">{data.why || 'Not analyzed'}</p>
            </div>
            <div className="text-center p-4 bg-white rounded border">
              <h4 className="font-semibold text-purple-600 mb-2">How</h4>
              <p className="text-sm text-gray-600">{data.how || 'Not analyzed'}</p>
            </div>
            <div className="text-center p-4 bg-white rounded border">
              <h4 className="font-semibold text-purple-600 mb-2">What</h4>
              <p className="text-sm text-gray-600">{data.what || 'Not analyzed'}</p>
            </div>
          </div>
        </div>
      );

    case 'clifton-strengths':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.top_strengths && data.top_strengths.slice(0, 4).map((strength: any, index: number) => (
              <div key={index} className="text-center p-3 bg-white rounded border">
                <div className="font-semibold text-orange-600">{strength.name}</div>
                <div className="text-sm text-gray-600">{strength.description}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'content-comparison':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded border">
              <h4 className="font-semibold text-indigo-600 mb-2">Existing Content</h4>
              <p className="text-sm text-gray-600">{data.existing?.title || 'Not analyzed'}</p>
            </div>
            <div className="p-4 bg-white rounded border">
              <h4 className="font-semibold text-indigo-600 mb-2">Proposed Content</h4>
              <p className="text-sm text-gray-600">{data.proposed?.title || 'Not analyzed'}</p>
            </div>
          </div>
        </div>
      );

    default:
      return <div>No overview available for this assessment type</div>;
  }
}

function renderDetails(data: any, assessmentType: string, getScoreColor: (score: number) => string, getScoreBadgeVariant: (score: number) => string) {
  switch (assessmentType) {
    case 'b2c-elements':
      return (
        <div className="space-y-6">
          {data.categories && (
            <div>
              <h4 className="font-semibold mb-4">Category Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.categories).map(([category, catData]: [string, any]) => (
                  <div key={category} className="p-4 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium capitalize">{category.replace('_', ' ')}</h5>
                      <Badge variant={getScoreBadgeVariant(catData.score)}>
                        {catData.score}%
                      </Badge>
                    </div>
                    {catData.elements && (
                      <div className="space-y-1">
                        {catData.elements.slice(0, 3).map((element: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{element.name}</span>
                            <Badge variant={getScoreBadgeVariant(element.score)} size="sm">
                              {element.score}/10
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.recommendations && data.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <div className="space-y-2">
                {data.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{rec.action}</span>
                      <Badge variant="outline">{rec.priority} Priority</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{rec.expected_revenue_impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'b2b-elements':
      return (
        <div className="space-y-4">
          <div className="text-center text-gray-600">
            B2B Elements detailed view coming soon
          </div>
        </div>
      );

    case 'golden-circle':
      return (
        <div className="space-y-4">
          <div className="text-center text-gray-600">
            Golden Circle detailed view coming soon
          </div>
        </div>
      );

    case 'clifton-strengths':
      return (
        <div className="space-y-4">
          <div className="text-center text-gray-600">
            CliftonStrengths detailed view coming soon
          </div>
        </div>
      );

    case 'content-comparison':
      return (
        <div className="space-y-4">
          <div className="text-center text-gray-600">
            Content Comparison detailed view coming soon
          </div>
        </div>
      );

    default:
      return <div>No details available for this assessment type</div>;
  }
}
