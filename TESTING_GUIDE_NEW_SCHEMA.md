# 🧪 Testing Guide - New Schema Analysis Tables

**Test the 60+ new tables with real analysis workflow**

---

## 🎯 **TESTING STRATEGY**

### **3 Levels of Testing:**

1. **Database Level** - Test tables and functions directly in Supabase
2. **API Level** - Test TypeScript services and API routes
3. **Frontend Level** - Test UI components with new data

---

## 📊 **LEVEL 1: DATABASE TESTING (Supabase)**

### **Test 1: Verify Pattern Matching Function**

**Go to:** Supabase SQL Editor  
**Run:**

```sql
-- Test pattern matching on sample content
SELECT * FROM find_value_patterns(
  'Save time with our lightning-fast automation. Affordable pricing. Easy drag-and-drop interface.',
  'saas'
);
```

**Expected Results:**
```
element_name    | pattern_text      | match_count | confidence
----------------|-------------------|-------------|------------
saves_time      | save time         | 1           | 1.0000
saves_time      | lightning-fast    | 1           | 0.8500
saves_time      | automation        | 1           | 0.8500
reduces_cost    | affordable        | 1           | 0.9000
simplifies      | easy              | 1           | 0.8500
simplifies      | drag-and-drop     | 1           | 0.9000
```

**If this works:** ✅ Pattern matching is functional!

---

### **Test 2: Verify CliftonStrengths Themes Loaded**

```sql
-- Count themes by domain
SELECT 
  domain,
  COUNT(*) as theme_count
FROM clifton_themes_reference
GROUP BY domain
ORDER BY domain;
```

**Expected Results:**
```
domain                  | theme_count
------------------------|------------
executing               | 9
influencing             | 8
relationship_building   | 9
strategic_thinking      | 8
```

**Total:** 34 themes ✅

---

### **Test 3: Create Sample Golden Circle Analysis**

```sql
-- Insert a test analysis
INSERT INTO golden_circle_analyses (
  analysis_id,
  overall_score,
  alignment_score,
  clarity_score
) VALUES (
  'test-001',
  85.5,
  90.0,
  80.0
) RETURNING *;

-- Add detailed WHY data
INSERT INTO golden_circle_why (
  golden_circle_id,
  score,
  current_state,
  clarity_rating,
  authenticity_rating,
  emotional_resonance_rating,
  differentiation_rating,
  evidence,
  recommendations
) VALUES (
  (SELECT id FROM golden_circle_analyses WHERE analysis_id = 'test-001'),
  90.0,
  'We help small businesses grow faster by eliminating barriers to digital marketing',
  9.0,
  8.5,
  9.5,
  8.0,
  '{"citations": ["homepage hero", "about page"], "matched_patterns": ["help", "grow", "faster"]}'::jsonb,
  '{"improvements": ["Make the WHY more emotional", "Add founder story"]}'::jsonb
) RETURNING *;

-- Verify it worked
SELECT 
  gc.analysis_id,
  gc.overall_score,
  gw.current_state,
  gw.clarity_rating
FROM golden_circle_analyses gc
JOIN golden_circle_why gw ON gw.golden_circle_id = gc.id
WHERE gc.analysis_id = 'test-001';
```

**If successful:** ✅ Golden Circle tables work!

---

### **Test 4: Test Overall Score Calculation**

```sql
-- Calculate overall score for test analysis
SELECT calculate_overall_score('test-001') as overall_score;
```

**Expected:** Returns a decimal score (e.g., 85.50)

---

## 💻 **LEVEL 2: API TESTING (TypeScript/Next.js)**

### **Test 1: Create Test API Route**

Create: `src/app/api/test-schema/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test 1: Count all tables
    const [
      websitesCount,
      goldenCircleCount,
      themesCount,
      valueElementsCount,
      patternsCount
    ] = await Promise.all([
      prisma.websites.count(),
      prisma.golden_circle_analyses.count(),
      prisma.clifton_themes_reference.count(),
      prisma.value_element_reference.count(),
      prisma.value_element_patterns.count()
    ])

    // Test 2: Get sample themes
    const sampleThemes = await prisma.clifton_themes_reference.findMany({
      take: 5,
      orderBy: { theme_name: 'asc' }
    })

    // Test 3: Get value elements
    const valueElements = await prisma.value_element_reference.findMany({
      where: {
        element_category: 'functional'
      },
      take: 5
    })

    // Test 4: Pattern matching via raw SQL
    const patterns = await prisma.$queryRaw<any[]>`
      SELECT * FROM find_value_patterns(
        'Save time with automation. Affordable and easy to use.',
        'saas'
      )
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      counts: {
        websites: websitesCount,
        goldenCircle: goldenCircleCount,
        themes: themesCount,
        valueElements: valueElementsCount,
        patterns: patternsCount
      },
      samples: {
        themes: sampleThemes,
        valueElements: valueElements,
        patternMatches: patterns
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
```

**Test it:**
```bash
# Start dev server
npm run dev

# In browser or curl:
curl http://localhost:3000/api/test-schema
```

**Expected Response:**
```json
{
  "success": true,
  "counts": {
    "websites": 0,
    "goldenCircle": 1,
    "themes": 34,
    "valueElements": 28,
    "patterns": 100
  },
  "samples": {
    "themes": [...],
    "valueElements": [...],
    "patternMatches": [...]
  }
}
```

---

### **Test 2: Create Full Analysis Test**

Create: `src/app/api/test-full-analysis/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { url, content, industry } = await req.json()

  try {
    // Step 1: Create Website entry
    const website = await prisma.websites.create({
      data: {
        url: url,
        domain: new URL(url).hostname,
        title: 'Test Website',
        industry: industry,
        business_type: 'B2B',
        total_analyses: 0
      }
    })

    // Step 2: Create Analysis (using existing User table)
    // Note: You'll need a real user_id from your User table
    const analysis = await prisma.Analysis.create({
      data: {
        content: content,
        contentType: 'website',
        status: 'PENDING',
        frameworks: JSON.stringify(['golden_circle', 'elements_of_value'])
      }
    })

    // Step 3: Run pattern matching
    const patterns = await prisma.$queryRaw<any[]>`
      SELECT * FROM find_value_patterns(${content}, ${industry})
      LIMIT 20
    `

    // Step 4: Create Golden Circle Analysis
    const goldenCircle = await prisma.golden_circle_analyses.create({
      data: {
        analysis_id: analysis.id,
        overall_score: 85.0,
        alignment_score: 90.0,
        clarity_score: 80.0
      }
    })

    // Step 5: Create WHY dimension
    const whyData = await prisma.golden_circle_why.create({
      data: {
        golden_circle_id: goldenCircle.id,
        score: 90.0,
        current_state: 'Extracted WHY statement from content',
        clarity_rating: 9.0,
        authenticity_rating: 8.5,
        emotional_resonance_rating: 9.0,
        differentiation_rating: 8.0,
        evidence: {
          citations: ['homepage', 'about'],
          patterns: patterns.slice(0, 5)
        },
        recommendations: {
          improvements: ['Strengthen emotional appeal', 'Add founder story']
        }
      }
    })

    // Step 6: Create Elements of Value analysis
    const eovB2B = await prisma.elements_of_value_b2b.create({
      data: {
        analysis_id: analysis.id,
        overall_score: 82.0,
        table_stakes_score: 90.0,
        functional_score: 85.0,
        ease_of_business_score: 80.0,
        individual_score: 75.0,
        inspirational_score: 70.0
      }
    })

    // Step 7: Add individual element scores
    const elementScores = await prisma.b2b_element_scores.createMany({
      data: patterns.slice(0, 5).map((p, idx) => ({
        eov_b2b_id: eovB2B.id,
        element_name: p.element_name,
        element_category: 'functional',
        category_level: 2,
        score: 85.0 - (idx * 2),
        weight: 1.0,
        weighted_score: 85.0 - (idx * 2),
        evidence: {
          pattern: p.pattern_text,
          confidence: p.confidence,
          matches: p.match_count
        }
      }))
    })

    // Step 8: Calculate overall score
    const overallScore = await prisma.$queryRaw<any[]>`
      SELECT calculate_overall_score(${analysis.id}) as score
    `

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        status: analysis.status,
        overallScore: overallScore[0]?.score || 0
      },
      website: {
        id: website.id,
        url: website.url
      },
      goldenCircle: {
        id: goldenCircle.id,
        overall_score: goldenCircle.overall_score,
        why: whyData
      },
      elementsOfValue: {
        id: eovB2B.id,
        overall_score: eovB2B.overall_score,
        elementCount: 5
      },
      patterns: patterns.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 })
  }
}
```

**Test it:**
```bash
curl -X POST http://localhost:3000/api/test-full-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "content": "Save time with our automated workflow platform. Reduce costs with our affordable pricing. Easy drag-and-drop interface makes setup effortless.",
    "industry": "saas"
  }'
```

**Expected:** Full analysis created with all related tables!

---

## 🎨 **LEVEL 3: FRONTEND TESTING (React Components)**

### **Test 1: Create Test Dashboard Page**

Create: `src/app/test-analysis/page.tsx`

```typescript
'use client'

import { useState } from 'react'

export default function TestAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runSchemaTest = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/test-schema')
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runFullAnalysisTest = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/test-full-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://test-company.com',
          content: 'Save time with automation. Affordable pricing. Easy to use drag-and-drop interface. Enterprise-grade security.',
          industry: 'saas'
        })
      })
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test New Schema</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={runSchemaTest}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Schema Tables'}
        </button>

        <button
          onClick={runFullAnalysisTest}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Analyzing...' : 'Run Full Analysis Test'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          
          {result.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <strong className="text-green-800">✅ Success!</strong>
              </div>

              {result.counts && (
                <div>
                  <h3 className="font-semibold mb-2">Table Counts:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Websites: {result.counts.websites}</li>
                    <li>Golden Circle Analyses: {result.counts.goldenCircle}</li>
                    <li>CliftonStrengths Themes: {result.counts.themes}</li>
                    <li>Value Elements: {result.counts.valueElements}</li>
                    <li>Pattern Matches: {result.counts.patterns}</li>
                  </ul>
                </div>
              )}

              {result.analysis && (
                <div>
                  <h3 className="font-semibold mb-2">Analysis Created:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Analysis ID: {result.analysis.id}</li>
                    <li>Overall Score: {result.analysis.overallScore}</li>
                    <li>Golden Circle Score: {result.goldenCircle?.overall_score}</li>
                    <li>Elements of Value Score: {result.elementsOfValue?.overall_score}</li>
                    <li>Patterns Found: {result.patterns}</li>
                  </ul>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">View Raw Data</summary>
                <pre className="mt-2 p-4 bg-gray-800 text-gray-100 rounded overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <strong className="text-red-800">❌ Test Failed</strong>
              <pre className="mt-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Access:** http://localhost:3000/test-analysis

---

## 🧪 **TESTING CHECKLIST**

### **Database Tests (Run in Supabase SQL Editor)**

```sql
-- ✅ Test 1: Pattern matching works
SELECT * FROM find_value_patterns('Save time with automation', 'saas');

-- ✅ Test 2: Themes loaded (should return 34)
SELECT COUNT(*) FROM clifton_themes_reference;

-- ✅ Test 3: Value elements loaded (should return 28)
SELECT COUNT(*) FROM value_element_reference;

-- ✅ Test 4: Patterns loaded (should return 100+)
SELECT COUNT(*) FROM value_element_patterns;

-- ✅ Test 5: Industry terms loaded (should return 80+)
SELECT COUNT(*) FROM industry_terminology;

-- ✅ Test 6: Can create Golden Circle analysis
INSERT INTO golden_circle_analyses (analysis_id, overall_score)
VALUES ('test-gc-001', 85.0)
RETURNING *;

-- ✅ Test 7: Can create WHY dimension
INSERT INTO golden_circle_why (
  golden_circle_id,
  score,
  current_state,
  clarity_rating
) VALUES (
  (SELECT id FROM golden_circle_analyses WHERE analysis_id = 'test-gc-001'),
  90.0,
  'Test WHY statement',
  9.0
) RETURNING *;

-- ✅ Test 8: Score calculation works
SELECT calculate_overall_score('test-gc-001');

-- ✅ Test 9: Cleanup test data
DELETE FROM golden_circle_analyses WHERE analysis_id LIKE 'test-%';
```

---

### **API Tests (Run with curl or Postman)**

```bash
# ✅ Test 1: Schema verification
curl http://localhost:3000/api/test-schema

# ✅ Test 2: Full analysis creation
curl -X POST http://localhost:3000/api/test-full-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://test.com",
    "content": "Save time and reduce costs with our platform",
    "industry": "saas"
  }'

# ✅ Test 3: Pattern matching only
curl -X POST http://localhost:3000/api/test-patterns \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Affordable, easy, and fast automation",
    "industry": "saas"
  }'
```

---

### **Frontend Tests (Manual)**

- ✅ Visit http://localhost:3000/test-analysis
- ✅ Click "Test Schema Tables" → Should show counts
- ✅ Click "Run Full Analysis Test" → Should create full analysis
- ✅ Verify no errors in browser console
- ✅ Check Supabase Table Editor → Should see new rows

---

## 🎯 **QUICK START TEST**

**Run this single command to test everything:**

Create: `scripts/test-schema.sh`

```bash
#!/bin/bash

echo "🧪 Testing New Schema..."
echo ""

echo "1️⃣ Testing Prisma connection..."
npx prisma db pull > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Prisma connected to Supabase"
else
  echo "❌ Prisma connection failed"
  exit 1
fi

echo ""
echo "2️⃣ Generating TypeScript types..."
npx prisma generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Types generated"
else
  echo "❌ Type generation failed"
  exit 1
fi

echo ""
echo "3️⃣ Starting dev server..."
npm run dev &
DEV_PID=$!
sleep 5

echo ""
echo "4️⃣ Testing API endpoints..."
curl -s http://localhost:3000/api/test-schema | grep -q "success"
if [ $? -eq 0 ]; then
  echo "✅ API test passed"
else
  echo "❌ API test failed"
fi

echo ""
echo "5️⃣ Stopping dev server..."
kill $DEV_PID

echo ""
echo "✅ All tests passed!"
echo ""
echo "Next: Visit http://localhost:3000/test-analysis to run interactive tests"
```

**Make executable and run:**
```bash
chmod +x scripts/test-schema.sh
./scripts/test-schema.sh
```

---

## 📊 **EXPECTED RESULTS SUMMARY**

### **After All Tests Pass:**

```
Database Layer:
  ✅ 60+ tables accessible
  ✅ 34 CliftonStrengths themes loaded
  ✅ 28 Value Elements loaded
  ✅ 100+ synonym patterns loaded
  ✅ 80+ industry terms loaded
  ✅ Pattern matching function works
  ✅ Score calculation function works

API Layer:
  ✅ Prisma Client generated with all tables
  ✅ TypeScript autocomplete for all tables
  ✅ Can create Golden Circle analyses
  ✅ Can create Elements of Value analyses
  ✅ Can query pattern matches
  ✅ Can calculate overall scores

Frontend Layer:
  ✅ Test page loads
  ✅ Can trigger analyses via UI
  ✅ Results display correctly
  ✅ No console errors
```

---

## 🚀 **WHAT TO TEST FIRST**

```bash
# 1. Verify DATABASE_URL is set
cat .env.local | grep DATABASE_URL

# 2. Update Prisma schema
npx prisma db pull
npx prisma generate

# 3. Test database connection
npx prisma studio
# Opens http://localhost:5555
# Click through tables to verify data

# 4. Start dev server
npm run dev

# 5. Test API
curl http://localhost:3000/api/test-schema

# 6. Open test page
# Visit: http://localhost:3000/test-analysis
# Click buttons to run tests
```

---

**Ready to start testing?** Let me know when you've set the DATABASE_URL and I'll help you run the first test!

