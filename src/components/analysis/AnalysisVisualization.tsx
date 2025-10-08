'use client';

import { AnalysisResult } from '@/lib/ai-providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  CheckCircle, 
  Star,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AnalysisVisualizationProps {
  analysis: AnalysisResult;
}

export function AnalysisVisualization({ analysis }: AnalysisVisualizationProps) {
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


  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Analysis Results</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="w-32">
              <Progress value={analysis.overallScore} className="h-3" />
            </div>
            <Badge variant={getScoreBadgeVariant(analysis.overallScore)} className="text-lg px-3 py-1">
              {analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground italic">
            &ldquo;{analysis.summary}&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="golden-circle" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="golden-circle" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Golden Circle
          </TabsTrigger>
          <TabsTrigger value="elements" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Elements of Value
          </TabsTrigger>
          <TabsTrigger value="strengths" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            CliftonStrengths
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Golden Circle Tab */}
        <TabsContent value="golden-circle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Golden Circle Analysis
                <Badge variant={getScoreBadgeVariant(analysis.goldenCircle.overallScore)} className="ml-auto">
                  {analysis.goldenCircle.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="text-2xl font-bold text-blue-600 mb-2">WHY</div>
                  <p className="text-sm text-muted-foreground">{analysis.goldenCircle.why.statement}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="text-2xl font-bold text-green-600 mb-2">HOW</div>
                  <p className="text-sm text-muted-foreground">{analysis.goldenCircle.how.methodology}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
                  <div className="text-2xl font-bold text-purple-600 mb-2">WHAT</div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.goldenCircle?.what?.offerings?.join(', ') || 'No offerings data available'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Key Insights</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.goldenCircle.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elements of Value Tab */}
        <TabsContent value="elements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Elements of Value Analysis
                <Badge variant={getScoreBadgeVariant(analysis.elementsOfValue.overallScore)} className="ml-auto">
                  {analysis.elementsOfValue.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Functional Elements */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Functional Elements (Top 10)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(analysis.elementsOfValue.functional)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .slice(0, 10)
                    .map(([key, value]) => (
                    <div key={key} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-sm font-bold ${getScoreColor(Number(value.score))}`}>{value.score}/10</span>
                      </div>
                      <Progress value={Number(value.score) * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotional Elements */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Emotional Elements (Top 10)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(analysis.elementsOfValue.emotional)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .slice(0, 10)
                    .map(([key, value]) => (
                    <div key={key} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-sm font-bold ${getScoreColor(Number(value.score))}`}>{value.score}/10</span>
                      </div>
                      <Progress value={Number(value.score) * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Life-Changing Elements */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Life-Changing Elements (Top 10)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(analysis.elementsOfValue.lifeChanging)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .slice(0, 10)
                    .map(([key, value]) => (
                    <div key={key} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-sm font-bold ${getScoreColor(Number(value.score))}`}>{value.score}/10</span>
                      </div>
                      <Progress value={Number(value.score) * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Impact Elements */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Social Impact Elements (Top 10)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(analysis.elementsOfValue.socialImpact)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .slice(0, 10)
                    .map(([key, value]) => (
                    <div key={key} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-sm font-bold ${getScoreColor(Number(value.score))}`}>{value.score}/10</span>
                      </div>
                      <Progress value={Number(value.score) * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Key Insights</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.elementsOfValue.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CliftonStrengths Tab */}
        <TabsContent value="strengths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                CliftonStrengths Analysis
                <Badge variant={getScoreBadgeVariant(analysis.cliftonStrengths.overallScore)} className="ml-auto">
                  {analysis.cliftonStrengths.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {analysis.cliftonStrengths.topThemes.map((theme, index) => (
                  <div key={theme} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{theme}</span>
                      <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Top Theme</div>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-lg">Strategic Recommendations</h4>
                <ul className="space-y-3">
                  {analysis.cliftonStrengths.topThemes.map((theme, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <Star className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-lg">Key Insights</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.cliftonStrengths.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                Actionable Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* High Priority Recommendations */}
              {analysis.recommendations.highPriority.map((rec, index) => (
                <div key={`high-${index}`} className="p-5 border-2 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <h4 className="font-semibold text-lg">{rec.title}</h4>
                    </div>
                    <Badge className="bg-red-600 text-white text-sm px-3 py-1">
                      HIGH PRIORITY
                    </Badge>
                  </div>
                  
                  <p className="text-base text-muted-foreground mb-4 leading-relaxed">{rec.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-2">Action Items:</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Impact: {rec.expectedImpact}</span>
                    <span>Effort: {rec.effort}</span>
                    <span>Timeline: {rec.timeline}</span>
                  </div>
                </div>
              ))}

              {/* Medium Priority Recommendations */}
              {analysis.recommendations.mediumPriority.map((rec, index) => (
                <div key={`medium-${index}`} className="p-5 border-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <h4 className="font-semibold text-lg">{rec.title}</h4>
                    </div>
                    <Badge className="bg-yellow-600 text-white text-sm px-3 py-1">
                      MEDIUM PRIORITY
                    </Badge>
                  </div>
                  
                  <p className="text-base text-muted-foreground mb-4 leading-relaxed">{rec.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-2">Action Items:</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Impact: {rec.expectedImpact}</span>
                    <span>Effort: {rec.effort}</span>
                    <span>Timeline: {rec.timeline}</span>
                  </div>
                </div>
              ))}

              {/* Low Priority Recommendations */}
              {analysis.recommendations.lowPriority.map((rec, index) => (
                <div key={`low-${index}`} className="p-5 border-2 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <h4 className="font-semibold text-lg">{rec.title}</h4>
                    </div>
                    <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                      LOW PRIORITY
                    </Badge>
                  </div>
                  
                  <p className="text-base text-muted-foreground mb-4 leading-relaxed">{rec.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-2">Action Items:</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Impact: {rec.expectedImpact}</span>
                    <span>Effort: {rec.effort}</span>
                    <span>Timeline: {rec.timeline}</span>
                  </div>
                </div>
              ))}

              {/* JSON Download Option */}
              <div className="mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Download Raw Analysis Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the complete analysis data in JSON format for further processing or integration
                  </p>
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(analysis, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = `analysis-${analysis.url?.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download JSON
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
