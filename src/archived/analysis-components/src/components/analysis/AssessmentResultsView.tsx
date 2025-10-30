'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  BarChart3,
  Brain,
  Building2,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Target,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AssessmentResultsViewProps {
  assessmentType:
    | 'b2c-elements'
    | 'b2b-elements'
    | 'golden-circle'
    | 'clifton-strengths'
    | 'content-comparison';
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
    borderColor: 'border-blue-200',
  },
  'b2b-elements': {
    title: 'B2B Elements of Value Analysis',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'golden-circle': {
    title: 'Golden Circle Analysis',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  'clifton-strengths': {
    title: 'CliftonStrengths Analysis',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'content-comparison': {
    title: 'Content Comparison Analysis',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
};

export function AssessmentResultsView({
  assessmentType,
  data,
  isLoading,
  error,
  onRetry,
  showRawData = false,
}: AssessmentResultsViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const config = ASSESSMENT_CONFIG[assessmentType];
  const IconComponent = config.icon;

  const handleCopyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Results copied to clipboard');
  };

  const handleDownloadResults = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
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

  const getScoreBadgeVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className={`${config.borderColor} ${config.bgColor}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-600" />
            <p className="text-gray-600">Running {config.title}...</p>
            <p className="mt-2 text-sm text-gray-500">
              This may take 30-60 seconds
            </p>
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
          <CardDescription>{config.title} encountered an error</CardDescription>
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
            <IconComponent className="mx-auto mb-4 h-8 w-8 text-gray-400" />
            <p className="text-gray-600">No analysis data available</p>
            <p className="mt-2 text-sm text-gray-500">
              Run an analysis to see results
            </p>
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
              <CardDescription>Analysis completed successfully</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyResults}>
              <Copy className="mr-1 h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadResults}>
              <Download className="mr-1 h-4 w-4" />
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
            {renderOverview(
              data,
              assessmentType,
              getScoreColor,
              getScoreBadgeVariant
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {renderDetails(
              data,
              assessmentType,
              getScoreColor,
              getScoreBadgeVariant
            )}
          </TabsContent>

          {showRawData && (
            <TabsContent value="raw" className="space-y-4">
              <div className="rounded-md bg-gray-100 p-4">
                <pre className="max-h-96 overflow-auto text-xs">
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

function renderOverview(
  data: any,
  assessmentType: string,
  getScoreColor: (score: number) => string,
  getScoreBadgeVariant: (
    score: number
  ) => 'default' | 'secondary' | 'destructive' | 'outline'
) {
  switch (assessmentType) {
    case 'b2c-elements':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getScoreColor(data.overall_score || 0)}`}
              >
                {data.overall_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-semibold ${getScoreColor(data.functional_score || 0)}`}
              >
                {data.functional_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Functional</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-semibold ${getScoreColor(data.emotional_score || 0)}`}
              >
                {data.emotional_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Emotional</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-semibold ${getScoreColor(data.life_changing_score || 0)}`}
              >
                {data.life_changing_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Life-Changing</div>
            </div>
          </div>

          {data.revenue_opportunities &&
            data.revenue_opportunities.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">
                  Top Revenue Opportunities
                </h4>
                <div className="space-y-2">
                  {data.revenue_opportunities
                    .slice(0, 3)
                    .map((opp: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded border bg-white p-2"
                      >
                        <span className="font-medium">{opp.element}</span>
                        <Badge
                          variant={getScoreBadgeVariant(
                            typeof opp.current_strength === 'number'
                              ? opp.current_strength
                              : 0
                          )}
                        >
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getScoreColor(data.overall_score || 0)}`}
              >
                {data.overall_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-semibold ${getScoreColor(data.table_stakes_score || 0)}`}
              >
                {data.table_stakes_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Table Stakes</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-semibold ${getScoreColor(data.functional_score || 0)}`}
              >
                {data.functional_score || 0}%
              </div>
              <div className="text-sm text-gray-600">Functional</div>
            </div>
            <div className="text-center">
              <div
                className={`text-xl font-semibold ${getScoreColor(data.ease_of_business_score || 0)}`}
              >
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded border bg-white p-4 text-center">
              <h4 className="mb-2 font-semibold text-purple-600">Why</h4>
              <p className="text-sm text-gray-600">
                {data.why || 'Not analyzed'}
              </p>
            </div>
            <div className="rounded border bg-white p-4 text-center">
              <h4 className="mb-2 font-semibold text-purple-600">How</h4>
              <p className="text-sm text-gray-600">
                {data.how || 'Not analyzed'}
              </p>
            </div>
            <div className="rounded border bg-white p-4 text-center">
              <h4 className="mb-2 font-semibold text-purple-600">What</h4>
              <p className="text-sm text-gray-600">
                {data.what || 'Not analyzed'}
              </p>
            </div>
          </div>
        </div>
      );

    case 'clifton-strengths':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.top_strengths &&
              data.top_strengths
                .slice(0, 4)
                .map((strength: any, index: number) => (
                  <div
                    key={index}
                    className="rounded border bg-white p-3 text-center"
                  >
                    <div className="font-semibold text-orange-600">
                      {strength.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {strength.description}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      );

    case 'content-comparison':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border bg-white p-4">
              <h4 className="mb-2 font-semibold text-indigo-600">
                Existing Content
              </h4>
              <p className="text-sm text-gray-600">
                {data.existing?.title || 'Not analyzed'}
              </p>
            </div>
            <div className="rounded border bg-white p-4">
              <h4 className="mb-2 font-semibold text-indigo-600">
                Proposed Content
              </h4>
              <p className="text-sm text-gray-600">
                {data.proposed?.title || 'Not analyzed'}
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return <div>No overview available for this assessment type</div>;
  }
}

function renderDetails(
  data: any,
  assessmentType: string,
  getScoreColor: (score: number) => string,
  getScoreBadgeVariant: (
    score: number
  ) => 'default' | 'secondary' | 'destructive' | 'outline'
) {
  switch (assessmentType) {
    case 'b2c-elements':
      return (
        <div className="space-y-6">
          {data.categories && (
            <div>
              <h4 className="mb-4 font-semibold">Category Breakdown</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(data.categories).map(
                  ([category, catData]: [string, any]) => (
                    <div key={category} className="rounded border bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="font-medium capitalize">
                          {category.replace('_', ' ')}
                        </h5>
                        <Badge
                          variant={getScoreBadgeVariant(
                            typeof catData.score === 'number'
                              ? catData.score
                              : 0
                          )}
                        >
                          {catData.score}%
                        </Badge>
                      </div>
                      {catData.elements && (
                        <div className="space-y-1">
                          {catData.elements
                            .slice(0, 3)
                            .map((element: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>{element.name}</span>
                                <Badge
                                  variant={getScoreBadgeVariant(
                                    typeof element.score === 'number'
                                      ? element.score
                                      : 0
                                  )}
                                >
                                  {element.score}/10
                                </Badge>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {data.recommendations && data.recommendations.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">Recommendations</h4>
              <div className="space-y-2">
                {data.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className="rounded border border-yellow-200 bg-yellow-50 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">{rec.action}</span>
                      <Badge variant="outline">{rec.priority} Priority</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {rec.expected_revenue_impact}
                    </p>
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
