/**
 * Golden Circle Comparison View
 * Side-by-side comparison of WHY/HOW/WHAT/WHO analyses
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Minus, TrendingDown, TrendingUp } from 'lucide-react'

interface GoldenCircleData {
  overall_score: number
  alignment_score: number
  clarity_score: number
  why: {
    current_state: string
    clarity_rating: number
    authenticity_rating: number
    emotional_resonance_rating: number
    differentiation_rating: number
    evidence: {
      patterns: string[]
      citations: string[]
    }
    recommendations: string[]
  }
  how: {
    current_state: string
    uniqueness_rating: number
    clarity_rating: number
    credibility_rating: number
    specificity_rating: number
    evidence: any
    recommendations: string[]
  }
  what: {
    current_state: string
    clarity_rating: number
    completeness_rating: number
    value_articulation_rating: number
    cta_clarity_rating: number
    evidence: any
    recommendations: string[]
  }
  who: {
    current_state: string
    specificity_rating: number
    resonance_rating: number
    accessibility_rating: number
    conversion_path_rating: number
    target_personas: string[]
    evidence: any
    recommendations: string[]
  }
}

interface Props {
  before?: GoldenCircleData
  after: GoldenCircleData
  showComparison?: boolean
}

export function GoldenCircleComparisonView({ before, after, showComparison = true }: Props) {
  const hasBeforeData = !!before

  const getScoreChange = (beforeScore: number, afterScore: number) => {
    const change = afterScore - beforeScore
    if (change > 0) return { icon: TrendingUp, color: 'text-green-600', text: `+${change.toFixed(1)}` }
    if (change < 0) return { icon: TrendingDown, color: 'text-red-600', text: change.toFixed(1) }
    return { icon: Minus, color: 'text-gray-600', text: '0' }
  }

  return (
    <div className="space-y-6">
      {/* Overall Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Golden Circle Analysis
            {hasBeforeData && (
              <Badge variant="outline">Before/After Comparison</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {showComparison ? 'Compare your Golden Circle scores over time' : 'Detailed Golden Circle analysis'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Overall Score */}
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Overall Score</div>
              <div className="flex items-center gap-2">
                {hasBeforeData && (
                  <>
                    <span className="text-2xl font-bold text-gray-400">{before.overall_score}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </>
                )}
                <span className="text-3xl font-bold">{after.overall_score}</span>
                {hasBeforeData && (() => {
                  const change = getScoreChange(before.overall_score, after.overall_score)
                  return (
                    <Badge variant="outline" className={change.color}>
                      {change.text}
                    </Badge>
                  )
                })()}
              </div>
            </div>

            {/* Alignment Score */}
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Alignment</div>
              <div className="flex items-center gap-2">
                {hasBeforeData && (
                  <>
                    <span className="text-2xl font-bold text-gray-400">{before.alignment_score}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </>
                )}
                <span className="text-3xl font-bold">{after.alignment_score}</span>
                {hasBeforeData && (() => {
                  const change = getScoreChange(before.alignment_score, after.alignment_score)
                  return (
                    <Badge variant="outline" className={change.color}>
                      {change.text}
                    </Badge>
                  )
                })()}
              </div>
            </div>

            {/* Clarity Score */}
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Clarity</div>
              <div className="flex items-center gap-2">
                {hasBeforeData && (
                  <>
                    <span className="text-2xl font-bold text-gray-400">{before.clarity_score}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </>
                )}
                <span className="text-3xl font-bold">{after.clarity_score}</span>
                {hasBeforeData && (() => {
                  const change = getScoreChange(before.clarity_score, after.clarity_score)
                  return (
                    <Badge variant="outline" className={change.color}>
                      {change.text}
                    </Badge>
                  )
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensional Analysis */}
      <Tabs defaultValue="why" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="why">WHY</TabsTrigger>
          <TabsTrigger value="how">HOW</TabsTrigger>
          <TabsTrigger value="what">WHAT</TabsTrigger>
          <TabsTrigger value="who">WHO</TabsTrigger>
        </TabsList>

        {/* WHY Dimension */}
        <TabsContent value="why">
          <Card>
            <CardHeader>
              <CardTitle>WHY - Purpose & Belief</CardTitle>
              <CardDescription>Your core purpose and reason for existing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Side-by-side comparison */}
              <div className={`grid ${hasBeforeData ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {hasBeforeData && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-3 flex items-center justify-between">
                      Before
                      <Badge variant="outline">Previous</Badge>
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded border">
                        <div className="text-sm font-medium mb-1">WHY Statement:</div>
                        <div className="text-sm">&quot;{before.why.current_state}&quot;</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <ScoreCard label="Clarity" score={before.why.clarity_rating} />
                        <ScoreCard label="Authenticity" score={before.why.authenticity_rating} />
                        <ScoreCard label="Emotional" score={before.why.emotional_resonance_rating} />
                        <ScoreCard label="Differentiation" score={before.why.differentiation_rating} />
                      </div>
                    </div>
                  </div>
                )}

                <div className={`p-4 border rounded-lg ${hasBeforeData ? 'bg-green-50' : ''}`}>
                  <h4 className="font-semibold mb-3 flex items-center justify-between">
                    {hasBeforeData ? 'After' : 'Current'}
                    <Badge variant="default" className="bg-green-600">
                      {hasBeforeData ? 'New' : 'Latest'}
                    </Badge>
                  </h4>
                  <div className="space-y-3">
                    <div className={`p-3 rounded border ${hasBeforeData ? 'bg-white' : 'bg-blue-50'}`}>
                      <div className="text-sm font-medium mb-1">WHY Statement:</div>
                      <div className="text-sm">&quot;{after.why.current_state}&quot;</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <ScoreCard
                        label="Clarity"
                        score={after.why.clarity_rating}
                        previousScore={hasBeforeData ? before.why.clarity_rating : undefined}
                      />
                      <ScoreCard
                        label="Authenticity"
                        score={after.why.authenticity_rating}
                        previousScore={hasBeforeData ? before.why.authenticity_rating : undefined}
                      />
                      <ScoreCard
                        label="Emotional"
                        score={after.why.emotional_resonance_rating}
                        previousScore={hasBeforeData ? before.why.emotional_resonance_rating : undefined}
                      />
                      <ScoreCard
                        label="Differentiation"
                        score={after.why.differentiation_rating}
                        previousScore={hasBeforeData ? before.why.differentiation_rating : undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-2">🔍 Evidence Found</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Patterns Detected:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {after.why.evidence.patterns.map((p: any, i: number) => (
                        <Badge key={i} variant="secondary">{typeof p === 'string' ? p : p.pattern_text}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>Citations:</strong>
                    <div className="text-xs text-gray-600 mt-1">
                      {after.why.evidence.citations.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold mb-2">💡 Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {after.why.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar structure for HOW, WHAT, WHO */}
        {/* (I'll create these too if you want) */}

      </Tabs>
    </div>
  )
}

// Helper component for score cards
function ScoreCard({
  label,
  score,
  previousScore
}: {
  label: string
  score: number
  previousScore?: number
}) {
  const hasChange = previousScore !== undefined
  const change = hasChange ? score - previousScore : 0

  return (
    <div className="p-2 border rounded bg-white">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        {hasChange && (
          <span className="text-sm text-gray-400">{previousScore.toFixed(1)}</span>
        )}
        <span className="text-xl font-bold">{score.toFixed(1)}</span>
        <span className="text-xs text-gray-500">/10</span>
        {hasChange && change !== 0 && (
          <Badge
            variant="outline"
            className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {change > 0 ? '+' : ''}{change.toFixed(1)}
          </Badge>
        )}
      </div>
    </div>
  )
}

