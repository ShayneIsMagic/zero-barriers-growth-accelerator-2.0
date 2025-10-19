/**
 * Comparison-Enhanced Assessment Component
 * Allows users to input comparison data for better scoring
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

interface ComparisonData {
  competitive_advantages: string[];
  market_opportunities: string[];
  target_audience: string[];
  value_propositions: string[];
  pain_points: string[];
  success_metrics: string[];
}

interface ComparisonEnhancedAssessmentProps {
  assessmentType: 'b2c-elements' | 'b2b-elements' | 'golden-circle' | 'clifton-strengths';
  onAnalysisComplete: (data: any) => void;
  scrapedContent: any;
  url: string;
}

export function ComparisonEnhancedAssessment({ 
  assessmentType, 
  onAnalysisComplete, 
  scrapedContent, 
  url 
}: ComparisonEnhancedAssessmentProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    competitive_advantages: [],
    market_opportunities: [],
    target_audience: [],
    value_propositions: [],
    pain_points: [],
    success_metrics: []
  });
  
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof ComparisonData>('competitive_advantages');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const addItem = () => {
    if (newItem.trim()) {
      setComparisonData(prev => ({
        ...prev,
        [activeCategory]: [...prev[activeCategory], newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const removeItem = (category: keyof ComparisonData, index: number) => {
    setComparisonData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const runEnhancedAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/analyze/enhanced/${assessmentType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          scrapedContent,
          comparisonData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result.data);
        onAnalysisComplete(result.data);
      } else {
        console.error('Analysis failed:', result.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAssessmentIcon = () => {
    switch (assessmentType) {
      case 'b2c-elements': return <Users className="h-5 w-5" />;
      case 'b2b-elements': return <Target className="h-5 w-5" />;
      case 'golden-circle': return <Brain className="h-5 w-5" />;
      case 'clifton-strengths': return <Zap className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getAssessmentTitle = () => {
    switch (assessmentType) {
      case 'b2c-elements': return 'B2C Elements of Value';
      case 'b2b-elements': return 'B2B Elements of Value';
      case 'golden-circle': return 'Golden Circle Analysis';
      case 'clifton-strengths': return 'CliftonStrengths Analysis';
      default: return 'Assessment';
    }
  };

  return (
    <div className="space-y-6">
      {/* Comparison Data Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getAssessmentIcon()}
            {getAssessmentTitle()} - Comparison Enhancement
          </CardTitle>
          <CardDescription>
            Add comparison data to get more accurate scoring and better recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as keyof ComparisonData)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="competitive_advantages">Competitive Advantages</TabsTrigger>
              <TabsTrigger value="market_opportunities">Market Opportunities</TabsTrigger>
              <TabsTrigger value="target_audience">Target Audience</TabsTrigger>
            </TabsList>
            
            <TabsContent value="competitive_advantages" className="space-y-4">
              <div className="space-y-2">
                <Label>What are your key competitive advantages?</Label>
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="e.g., 24/7 customer support, AI-powered features"
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  />
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {comparisonData.competitive_advantages.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('competitive_advantages', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="market_opportunities" className="space-y-4">
              <div className="space-y-2">
                <Label>What market opportunities do you see?</Label>
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="e.g., Emerging markets, new customer segments"
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  />
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {comparisonData.market_opportunities.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('market_opportunities', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="target_audience" className="space-y-4">
              <div className="space-y-2">
                <Label>Who is your target audience?</Label>
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="e.g., Small business owners, enterprise decision makers"
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  />
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {comparisonData.target_audience.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('target_audience', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-4">
            <Button 
              onClick={runEnhancedAnalysis}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Enhanced Analysis...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Run Enhanced Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Enhanced Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResult.overall_score}/100
                  </div>
                  <div className="text-sm text-blue-800">Overall Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResult.comparison_insights?.competitive_position || 'N/A'}
                  </div>
                  <div className="text-sm text-green-800">Competitive Position</div>
                </div>
              </div>

              {analysisResult.comparison_insights && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Comparison Insights</h4>
                  <div className="space-y-2">
                    {analysisResult.comparison_insights.improvement_potential?.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
