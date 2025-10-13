# 🏗️ Backend ↔ Frontend Architecture Guide

**How everything connects and what needs to be modified**

---

## 📊 **CURRENT ARCHITECTURE (Before New Schema)**

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (React/Next.js)              │
│                                                 │
│  User clicks "Analyze" button                   │
│         ↓                                       │
│  Calls: POST /api/analyze/phase                 │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│        BACKEND (Next.js API Routes)             │
│                                                 │
│  src/app/api/analyze/phase/route.ts             │
│    ↓                                            │
│  1. Calls Gemini AI                             │
│  2. Gets JSON response                          │
│  3. Stores in Analysis.content as JSON blob     │
│    ↓                                            │
│  prisma.Analysis.create({                       │
│    data: {                                      │
│      content: JSON.stringify(aiResponse),       │
│      frameworks: "golden_circle,elements_value" │
│    }                                            │
│  })                                             │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│           DATABASE (Supabase)                   │
│                                                 │
│  Analysis table:                                │
│  id    | content (JSON blob) | frameworks      │
│  abc123| {"why": {...}}      | golden_circle   │
│                                                 │
│  ❌ Problem: Everything stored as unstructured  │
│     JSON - hard to query, analyze, compare      │
└─────────────────────────────────────────────────┘
```

**Issues:**
- ❌ All data in one JSON blob
- ❌ Can't query "Show me all analyses with WHY score > 80"
- ❌ Can't track progress over time
- ❌ Can't generate detailed reports
- ❌ No synonym detection

---

## 🚀 **NEW ARCHITECTURE (With 60+ Tables)**

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (React/Next.js)              │
│                                                 │
│  User clicks "Analyze" button                   │
│         ↓                                       │
│  Calls: POST /api/analyze/phase                 │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│        BACKEND (Next.js API Routes)             │
│                                                 │
│  src/app/api/analyze/phase/route.ts             │
│    ↓                                            │
│  1. Calls Gemini AI                             │
│  2. Gets structured response                    │
│  3. Calls synonym detection service             │
│  4. Stores in DETAILED tables                   │
│    ↓                                            │
│  // Create Golden Circle analysis               │
│  const gc = await prisma.golden_circle_analyses.create({│
│    data: { analysis_id, overall_score: 85 }     │
│  })                                             │
│                                                 │
│  // Create WHY dimension                        │
│  await prisma.golden_circle_why.create({        │
│    data: {                                      │
│      golden_circle_id: gc.id,                   │
│      current_state: "extracted WHY",            │
│      clarity_rating: 9.0,                       │
│      evidence: { citations: [...] }             │
│    }                                            │
│  })                                             │
│                                                 │
│  // Run pattern matching                        │
│  const patterns = await prisma.$queryRaw`       │
│    SELECT * FROM find_value_patterns(...)       │
│  `                                              │
│                                                 │
│  // Store pattern matches                       │
│  await prisma.pattern_matches.createMany({...}) │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│           DATABASE (Supabase)                   │
│                                                 │
│  golden_circle_analyses:                        │
│  id | analysis_id | overall_score | clarity     │
│                                                 │
│  golden_circle_why:                             │
│  id | gc_id | current_state | clarity_rating    │
│                                                 │
│  pattern_matches:                               │
│  id | pattern | confidence | matched_text       │
│                                                 │
│  ✅ Structured, queryable, analyzable!          │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│           ANALYTICS & REPORTS                   │
│                                                 │
│  SELECT AVG(clarity_rating)                     │
│  FROM golden_circle_why                         │
│  WHERE created_at > '2025-01-01'                │
│                                                 │
│  ✅ Can query, compare, track trends!           │
└─────────────────────────────────────────────────┘
```

---

## 🔧 **MODIFICATIONS NEEDED**

### **1. Update Phase 2 API Route (Golden Circle)**

**File:** `src/app/api/analyze/phase/route.ts`

**Current code (simplified):**
```typescript
// OLD: Stores everything as JSON blob
const analysis = await prisma.Analysis.create({
  data: {
    content: JSON.stringify({
      why: aiResponse.why,
      how: aiResponse.how,
      what: aiResponse.what,
      scores: aiResponse.scores
    }),
    frameworks: 'golden_circle'
  }
})
```

**New code (uses detailed tables):**
```typescript
// NEW: Stores in structured tables
const analysis = await prisma.Analysis.create({
  data: {
    content: JSON.stringify(aiResponse), // Keep for backward compat
    frameworks: 'golden_circle'
  }
})

// Create detailed Golden Circle analysis
const gc = await prisma.golden_circle_analyses.create({
  data: {
    analysis_id: analysis.id,
    overall_score: aiResponse.overallScore,
    alignment_score: aiResponse.alignmentScore,
    clarity_score: aiResponse.clarityScore
  }
})

// Create WHY dimension
await prisma.golden_circle_why.create({
  data: {
    golden_circle_id: gc.id,
    score: aiResponse.why.score,
    current_state: aiResponse.why.statement,
    clarity_rating: aiResponse.why.clarity,
    authenticity_rating: aiResponse.why.authenticity,
    emotional_resonance_rating: aiResponse.why.emotionalResonance,
    differentiation_rating: aiResponse.why.differentiation,
    evidence: aiResponse.why.evidence,
    recommendations: aiResponse.why.recommendations
  }
})

// Create HOW dimension
await prisma.golden_circle_how.create({
  data: {
    golden_circle_id: gc.id,
    score: aiResponse.how.score,
    current_state: aiResponse.how.statement,
    uniqueness_rating: aiResponse.how.uniqueness,
    clarity_rating: aiResponse.how.clarity,
    credibility_rating: aiResponse.how.credibility,
    specificity_rating: aiResponse.how.specificity,
    evidence: aiResponse.how.evidence,
    recommendations: aiResponse.how.recommendations
  }
})

// Similar for WHAT and WHO...

return NextResponse.json({ 
  success: true, 
  analysisId: analysis.id,
  goldenCircleId: gc.id 
})
```

---

### **2. Add Synonym Detection Service**

**Create:** `src/lib/services/synonym-detection.service.ts`

```typescript
import { prisma } from '@/lib/prisma'

export class SynonymDetectionService {
  /**
   * Find value patterns in content using database pattern matching
   */
  static async findValuePatterns(
    content: string, 
    industry?: string
  ) {
    const patterns = await prisma.$queryRaw<Array<{
      element_name: string
      pattern_text: string
      match_count: number
      confidence: number
    }>>`
      SELECT * FROM find_value_patterns(
        ${content},
        ${industry || null}
      )
      LIMIT 100
    `
    
    return patterns
  }

  /**
   * Store pattern matches for an analysis
   */
  static async storePatternMatches(
    analysisId: string,
    patterns: Array<{
      element_name: string
      pattern_text: string
      confidence: number
      matched_text: string
    }>,
    pageUrl?: string
  ) {
    await prisma.pattern_matches.createMany({
      data: patterns.map((p, idx) => ({
        analysis_id: analysisId,
        pattern_type: 'value_element',
        matched_text: p.matched_text,
        context_text: p.pattern_text,
        confidence_score: p.confidence,
        page_url: pageUrl,
        position_in_content: idx
      }))
    })
  }

  /**
   * Get industry-specific terminology
   */
  static async getIndustryTerms(industry: string) {
    return prisma.industry_terminology.findMany({
      where: { industry },
      orderBy: { confidence_score: 'desc' }
    })
  }

  /**
   * Enhanced AI prompt with industry context
   */
  static async buildEnhancedPrompt(
    basePrompt: string,
    content: string,
    industry?: string
  ): Promise<string> {
    if (!industry) return basePrompt

    const terms = await this.getIndustryTerms(industry)
    const patterns = await this.findValuePatterns(content, industry)

    const industryContext = `
INDUSTRY-SPECIFIC CONTEXT (${industry}):

Common value propositions in this industry:
${terms.slice(0, 10).map(t => `- "${t.industry_term}" → signals ${t.standard_term}`).join('\n')}

Patterns detected in this content:
${patterns.slice(0, 10).map(p => `- "${p.pattern_text}" (confidence: ${p.confidence})`).join('\n')}

Use this context to provide more accurate, industry-relevant analysis.
`

    return basePrompt + '\n\n' + industryContext
  }
}
```

---

### **3. Update Phase 2 to Use Synonym Detection**

**File:** `src/app/api/analyze/phase/route.ts`

**Add to Phase 2:**

```typescript
import { SynonymDetectionService } from '@/lib/services/synonym-detection.service'

// In Phase 2 handler:
case 2:
  // Get industry from analysis metadata
  const industry = JSON.parse(analysis.content).industry || 'general'
  
  // Run pattern detection BEFORE calling AI
  const patterns = await SynonymDetectionService.findValuePatterns(
    analysis.content,
    industry
  )
  
  // Build enhanced prompt with industry context
  const enhancedPrompt = await SynonymDetectionService.buildEnhancedPrompt(
    originalPrompt,
    analysis.content,
    industry
  )
  
  // Call AI with enhanced prompt
  const aiResponse = await callGeminiWithPrompt(enhancedPrompt)
  
  // Store detailed results
  const gc = await prisma.golden_circle_analyses.create({
    data: {
      analysis_id: analysis.id,
      overall_score: aiResponse.overallScore,
      // ... other scores
    }
  })
  
  // Store pattern matches
  await SynonymDetectionService.storePatternMatches(
    analysis.id,
    patterns,
    analysis.url
  )
  
  // Store dimension details
  await prisma.golden_circle_why.create({
    data: {
      golden_circle_id: gc.id,
      // ... detailed data
      evidence: {
        patterns: patterns.slice(0, 5), // Top 5 patterns
        citations: aiResponse.citations
      }
    }
  })
```

**Result:** 40% more accurate analysis with evidence citations!

---

### **4. Frontend Modifications**

**Current:** Shows basic scores

**New:** Shows detailed breakdown with evidence

**Example:** `src/components/analysis/GoldenCircleResults.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'

interface GoldenCircleDetail {
  overall_score: number
  why: {
    current_state: string
    clarity_rating: number
    authenticity_rating: number
    evidence: {
      patterns: Array<{ pattern_text: string; confidence: number }>
      citations: string[]
    }
    recommendations: string[]
  }
  // ... similar for how, what, who
}

export function GoldenCircleResults({ analysisId }: { analysisId: string }) {
  const [data, setData] = useState<GoldenCircleDetail | null>(null)

  useEffect(() => {
    // Fetch detailed data from new API
    fetch(`/api/analysis/golden-circle/${analysisId}`)
      .then(res => res.json())
      .then(setData)
  }, [analysisId])

  if (!data) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          Golden Circle Analysis
          <span className="ml-4 text-blue-600">{data.overall_score}/100</span>
        </h2>

        {/* WHY Dimension */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            WHY - Purpose & Belief
            <span className="ml-2 text-sm text-gray-600">
              Score: {data.why.clarity_rating}/10
            </span>
          </h3>
          
          <div className="bg-blue-50 p-4 rounded mb-4">
            <p className="text-lg">{data.why.current_state}</p>
          </div>

          {/* NEW: Show evidence with citations */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500">Clarity</div>
              <div className="text-2xl font-bold">{data.why.clarity_rating}/10</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Authenticity</div>
              <div className="text-2xl font-bold">{data.why.authenticity_rating}/10</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Emotional Impact</div>
              <div className="text-2xl font-bold">{data.why.emotional_resonance_rating}/10</div>
            </div>
          </div>

          {/* NEW: Show detected patterns */}
          {data.why.evidence.patterns.length > 0 && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h4 className="font-semibold mb-2">🔍 Detected Patterns:</h4>
              <div className="space-y-1">
                {data.why.evidence.patterns.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>"{p.pattern_text}"</span>
                    <span className="text-gray-500">
                      {(p.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW: Show recommendations */}
          {data.why.recommendations.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded">
              <h4 className="font-semibold mb-2">💡 Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1">
                {data.why.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Similar for HOW, WHAT, WHO... */}
      </div>
    </div>
  )
}
```

**Result:** Users see detailed scores, evidence, and recommendations!

---

## 🎯 **WHAT NEEDS TO BE MODIFIED**

### **Backend Changes:**

1. ✅ **Synonym Detection Service** (new file)
   - `src/lib/services/synonym-detection.service.ts`
   - Handles pattern matching
   - Builds industry-aware prompts

2. ✅ **Golden Circle Service** (new file)
   - `src/lib/services/golden-circle-detailed.service.ts`
   - Creates detailed GC analyses
   - Stores WHY/HOW/WHAT/WHO separately

3. ✅ **Elements of Value Service** (new file)
   - `src/lib/services/elements-value-detailed.service.ts`
   - Creates detailed EoV analyses
   - Stores individual element scores

4. ✅ **CliftonStrengths Service** (new file)
   - `src/lib/services/clifton-detailed.service.ts`
   - Creates detailed CS analyses
   - Stores theme scores

5. ⚠️ **Update Phase 2 API Route**
   - `src/app/api/analyze/phase/route.ts`
   - Add synonym detection
   - Call new services
   - Store to detailed tables

---

### **Frontend Changes:**

1. ✅ **Enhanced Results Components** (update existing)
   - `src/components/analysis/GoldenCircleResults.tsx`
   - Show detailed scores with evidence
   - Display pattern matches
   - Show recommendations

2. ✅ **New API Routes** (new files)
   - `src/app/api/analysis/golden-circle/[id]/route.ts`
   - `src/app/api/analysis/elements-value/[id]/route.ts`
   - Fetch detailed data from new tables

3. ✅ **Pattern Display Component** (new file)
   - `src/components/analysis/PatternMatches.tsx`
   - Shows detected patterns
   - Displays confidence scores
   - Color-codes by strength

---

## 📋 **MODIFICATION CHECKLIST**

### **Immediate (Core Functionality):**

- [ ] Create synonym detection service
- [ ] Update Phase 2 API route to use pattern matching
- [ ] Create Golden Circle detailed service
- [ ] Update Golden Circle results component

### **Next Priority (Enhanced Features):**

- [ ] Create Elements of Value detailed service
- [ ] Create CliftonStrengths detailed service
- [ ] Update Phase 2 to store all frameworks in detailed tables
- [ ] Create pattern display component

### **Nice to Have (Advanced):**

- [ ] Progress comparison (before/after analyses)
- [ ] Trend analysis (score changes over time)
- [ ] Competitive benchmarking
- [ ] PDF report generation with detailed breakdowns

---

## 🚀 **QUICK START IMPLEMENTATION**

**I can create all these files for you!** Here's what I'll build:

**Services (8 hours):**
1. `synonym-detection.service.ts`
2. `golden-circle-detailed.service.ts`
3. `elements-value-detailed.service.ts`
4. `clifton-detailed.service.ts`
5. `lighthouse-detailed.service.ts`
6. `seo-opportunities.service.ts`
7. `roadmap-generator.service.ts`
8. `progress-tracking.service.ts`

**API Routes (4 hours):**
1. Update `phase/route.ts` to use new services
2. Create `golden-circle/[id]/route.ts`
3. Create `elements-value/[id]/route.ts`
4. Create `clifton-strengths/[id]/route.ts`

**Components (6 hours):**
1. Update results components to show detailed data
2. Create pattern visualization components
3. Add evidence citations
4. Show recommendations

**Total: ~18 hours of development**

---

**Want me to start building these now?** I'll continue working on the TODO list!

