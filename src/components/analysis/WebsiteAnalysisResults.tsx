'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { _WebsiteAnalysisResult } from '@/types/analysis';
import {
    AlertCircle,
    CheckCircle,
    Download,
    ExternalLink,
    Gauge,
    Lightbulb,
    Share2,
    Target,
    TrendingUp,
    Users,
    XCircle
} from 'lucide-react';
import { LighthouseAnalysisResults } from './LighthouseAnalysisResults';

interface WebsiteAnalysisResultsProps {
  result: WebsiteAnalysisResult;
}

export function WebsiteAnalysisResults({ result }: WebsiteAnalysisResultsProps) {
  // Early return if result is null or undefined
  if (!result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No analysis results available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="h-4 w-4" />;
    if (score >= 6) return <AlertCircle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Analysis Score
          </CardTitle>
          <CardDescription>
            Analysis of {result.url} completed on {result.timestamp ? new Date(result.timestamp).toLocaleDateString() : 'Unknown date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {result.overallScore.toFixed(1)}/10
            </div>
            <div className="flex-1">
              <Progress value={result.overallScore * 10} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {result.overallScore >= 8 ? 'Excellent' :
                 result.overallScore >= 6 ? 'Good' :
                 result.overallScore >= 4 ? 'Needs Improvement' : 'Critical Issues'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Analysis Tabs */}
      <Tabs defaultValue="golden-circle" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="golden-circle">Golden Circle</TabsTrigger>
          <TabsTrigger value="elements-value">Elements of Value</TabsTrigger>
          <TabsTrigger value="b2b-elements">B2B Elements</TabsTrigger>
          <TabsTrigger value="clifton-strengths">CliftonStrengths</TabsTrigger>
          <TabsTrigger value="transformation">Transformation</TabsTrigger>
          <TabsTrigger value="lighthouse">Performance</TabsTrigger>
        </TabsList>

        {/* Golden Circle Analysis */}
        <TabsContent value="golden-circle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Simon Sinek&apos;s Golden Circle Analysis
              </CardTitle>
              <CardDescription>
                Overall Score: {result.goldenCircle?.overallScore?.toFixed(1) || 'N/A'}/10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Why */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Why (Purpose)</h4>
                  <Badge className={getScoreColor(result.goldenCircle?.why?.score || 0)}>
                    {result.goldenCircle?.why?.score || 0}/10
                  </Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{result.goldenCircle?.why?.currentState || 'No current state available'}</p>
                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-1">Issues:</h5>
                    <ul className="text-sm space-y-1">
                      {(result.goldenCircle?.why?.issues || []).map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-1">Recommended Message:</h5>
                    <p className="text-sm bg-green-50 p-3 rounded border">{result.goldenCircle?.why?.transformedMessage || 'No transformed message available'}</p>
                  </div>
                </div>
              </div>

              {/* How */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">How (Process)</h4>
                  <Badge className={getScoreColor(result.goldenCircle?.how?.score || 0)}>
                    {result.goldenCircle?.how?.score || 'N/A'}/10
                  </Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{result.goldenCircle?.how?.currentState || 'No data available'}</p>
                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-1">Recommended Process:</h5>
                    <p className="text-sm bg-green-50 p-3 rounded border">{result.goldenCircle?.how?.transformedMessage || 'No recommendations available'}</p>
                  </div>
                </div>
              </div>

              {/* What */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">What (Product)</h4>
                  <Badge className={getScoreColor(result.goldenCircle?.what?.score || 0)}>
                    {result.goldenCircle?.what?.score || 0}/10
                  </Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{result.goldenCircle?.what?.currentState || 'No current state available'}</p>
                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-1">Recommended Offering:</h5>
                    <p className="text-sm bg-green-50 p-3 rounded border">{result.goldenCircle?.what?.transformedMessage || 'No transformed message available'}</p>
                  </div>
                </div>
              </div>

              {/* Who */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Who (Target Audience)</h4>
                  <Badge className={getScoreColor(result.goldenCircle?.who?.score || 0)}>
                    {result.goldenCircle?.who?.score || 0}/10
                  </Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{result.goldenCircle?.who?.currentState || 'No current state available'}</p>

                  <div>
                    <h5 className="text-sm font-medium text-blue-600 mb-1">Target Audiences:</h5>
                    <ul className="text-sm space-y-1">
                      {(result.goldenCircle?.who?.targetAudience || []).map((audience, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Users className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {audience}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-purple-600 mb-1">Emotional Connection:</h5>
                    <p className="text-sm bg-purple-50 p-3 rounded border">{result.goldenCircle?.who?.emotionalConnection || 'No emotional connection strategy identified'}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-1">Issues:</h5>
                    <ul className="text-sm space-y-1">
                      {(result.goldenCircle?.who?.issues || []).map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-1">Recommended Message:</h5>
                    <p className="text-sm bg-green-50 p-3 rounded border">{result.goldenCircle?.who?.transformedMessage || 'No transformed message available'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elements of Value Analysis */}
        <TabsContent value="elements-value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Consumer Elements of Value Analysis
              </CardTitle>
              <CardDescription>
                Overall Score: {result.elementsOfValue.overallScore.toFixed(1)}/10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.elementsOfValue && Object.entries(result.elementsOfValue).filter(([key]) => key !== 'overallScore' && key !== 'insights').map(([category, data]: [string, any]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</h4>
                    <Badge className={getScoreColor(data.score)}>
                      {data.score}/10
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {data.elements && Object.entries(data.elements).map(([element, value]: [string, any]) => (
                      <div key={element} className="flex items-center gap-2">
                        {value ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="capitalize">{element.replace(/([A-Z])/g, ' $1')}</span>
                      </div>
                    ))}
                  </div>
                  {data.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-blue-600 mb-1">Recommendations:</h5>
                      <ul className="text-sm space-y-1">
                        {data.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* B2B Elements Analysis */}
        <TabsContent value="b2b-elements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                B2B Elements of Value Analysis
              </CardTitle>
              <CardDescription>
                Overall Score: {result.b2bElements?.overallScore?.toFixed(1) || 'N/A'}/10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.b2bElements ? Object.entries(result.b2bElements).filter(([key]) => key !== 'overallScore').map(([category, data]: [string, any]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</h4>
                    <Badge className={getScoreColor(data.score)}>
                      {data.score}/10
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {data.elements && Object.entries(data.elements).map(([element, value]: [string, any]) => (
                      <div key={element} className="flex items-center gap-2">
                        {value ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="capitalize">{element.replace(/([A-Z])/g, ' $1')}</span>
                      </div>
                    ))}
                  </div>
                  {data.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-blue-600 mb-1">Recommendations:</h5>
                      <ul className="text-sm space-y-1">
                        {data.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>B2B Elements analysis not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CliftonStrengths Analysis */}
        <TabsContent value="clifton-strengths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                CliftonStrengths Domains Analysis
              </CardTitle>
              <CardDescription>
                Overall Score: {result.cliftonStrengths.overallScore.toFixed(1)}/10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.cliftonStrengths && Object.entries(result.cliftonStrengths).filter(([key]) => key !== 'overallScore' && key !== 'insights' && key !== 'recommendations' && key !== 'topThemes').map(([domain, data]: [string, any]) => (
                <div key={domain} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">{domain.replace(/([A-Z])/g, ' $1')}</h4>
                    <Badge className={getScoreColor(data.score)}>
                      {data.score}/10
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(data.elements).map(([element, value]: [string, any]) => (
                      <div key={element} className="flex items-center gap-2">
                        {value ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="capitalize">{element}</span>
                      </div>
                    ))}
                  </div>
                  {data.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-blue-600 mb-1">Recommendations:</h5>
                      <ul className="text-sm space-y-1">
                        {data.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transformation Analysis */}
        <TabsContent value="transformation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Transformation Messaging Analysis
              </CardTitle>
              <CardDescription>
                Overall Score: {result.transformation.overallScore.toFixed(1)}/10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Section */}
              <div>
                <h4 className="font-medium mb-2">Hero Section</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Current:</span>
                    <Badge variant="outline">{result.transformation.currentMessaging.heroSection.score}/10</Badge>
                  </div>
                  <p className="text-sm bg-gray-50 p-3 rounded border">{result.transformation.currentMessaging.heroSection.current}</p>
                  <p className="text-sm bg-green-50 p-3 rounded border font-medium">{result.transformation.currentMessaging.heroSection.recommended}</p>
                </div>
              </div>

              {/* Service Descriptions */}
              <div>
                <h4 className="font-medium mb-2">Service Descriptions</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Current:</span>
                    <Badge variant="outline">{result.transformation.currentMessaging.serviceDescriptions.score}/10</Badge>
                  </div>
                  <div className="space-y-2">
                    {result.transformation.currentMessaging.serviceDescriptions.current.map((desc, index) => (
                      <p key={index} className="text-sm bg-gray-50 p-2 rounded border">{desc}</p>
                    ))}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-2">Recommended:</h5>
                    <div className="space-y-2">
                      {result.transformation.currentMessaging.serviceDescriptions.recommended.map((desc, index) => (
                        <p key={index} className="text-sm bg-green-50 p-2 rounded border font-medium">{desc}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Analysis */}
              <div>
                <h4 className="font-medium mb-2">Social Media Strategy</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Score:</span>
                    <Badge variant="outline">{result.transformation.socialMediaAnalysis.score}/10</Badge>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-blue-600 mb-2">Recommended Posts:</h5>
                    <div className="space-y-2">
                      {result.transformation.socialMediaAnalysis.recommendedPosts.map((post, index) => (
                        <p key={index} className="text-sm bg-blue-50 p-3 rounded border">{post}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lighthouse Performance Analysis */}
        <TabsContent value="lighthouse" className="space-y-4">
          {result.lighthouseAnalysis ? (
            <LighthouseAnalysisResults analysis={result.lighthouseAnalysis} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Performance Analysis
                </CardTitle>
                <CardDescription>
                  Lighthouse performance analysis is not available for this analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Performance analysis may not be available due to technical limitations or the analysis being performed with mock data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Implementation Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-red-600 mb-3">Immediate (Week 1-2)</h4>
            <ul className="space-y-2">
              {result.recommendations.immediate.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-yellow-600 mb-3">Short-term (Week 3-6)</h4>
            <ul className="space-y-2">
              {result.recommendations.shortTerm.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-green-600 mb-3">Long-term (Month 2-3)</h4>
            <ul className="space-y-2">
              {result.recommendations.longTerm.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          View Website
        </Button>
      </div>
    </div>
  );
}
