# Flow Audit and Fixes - Framework Analysis System

> **Superseded for taxonomy counts (June 2026):** B2B structure is **4+5+21+7+3** per [`B2B-BAIN-PYRAMID-TAXONOMY.md`](frameworks/B2B-BAIN-PYRAMID-TAXONOMY.md). B2C/Clifton counts below remain valid. For current authority hierarchy see [`docs/guides/README.md`](guides/README.md#documentation-authority-prevent-conflicts).

## 🔍 Audit Results

### Question 1: How to Select Existing Content First, Then Choose Frameworks

**Current Issue**: Framework Analysis Runner appears after content collection, but the flow doesn't clearly show how to select the collected content first.

**Solution Needed**: 
- Make it clear that content must be collected first
- Show selected content prominently before framework selection
- Allow re-selection of content from stored data

### Question 2: AI Usage - Only for Analysis/Comparisons

**Current Status**: ✅ **CORRECT**
- Content collection uses Puppeteer (no AI) ✅
- AI is only called when:
  - Proposed content exists (for comparison) ✅
  - Framework analysis is requested ✅
- Content scraping is purely technical extraction ✅

**Verification**:
- `PuppeteerComprehensiveCollector` - No AI ✅
- `ProductionContentExtractor` - No AI ✅
- AI only in: `generateComparisonReport`, `analyzeWithGemini`, `EnhancedAnalysisService` ✅

### Question 3: Framework Implementation vs README

**Status**: ⚠️ **NEEDS VERIFICATION**

**README Defines**:
- B2C: 30 elements (14 Functional, 10 Emotional, 5 Life-Changing, 1 Social Impact)
- B2B: 40 elements (4 Table Stakes, 5 Functional, 21 Ease of Business, 7 Individual, 3 Inspirational) — see Bain taxonomy doc
- Golden Circle: 4 components (WHY, HOW, WHAT, WHO) with 6 dimensions each
- CliftonStrengths: 34 themes across 4 domains

**Scoring System**:
- Flat fractional scoring: 0.0-1.0
- No weights - all elements equal
- Simple averages throughout

**Action Required**: Verify framework JSON files match README definitions exactly.

### Question 4: Complete Flow Audit

**Current Flow**:
1. ✅ Content Collection (Puppeteer - no AI)
2. ✅ Content Storage (Local Forage + Database)
3. ⚠️ Content Selection (needs improvement)
4. ⚠️ Framework Selection (exists but flow unclear)
5. ⚠️ Prompt Generation (needs verification against README)
6. ⚠️ Assessment Execution (runs all at once, should be one at a time)
7. ✅ Report Generation
8. ✅ Report Storage
9. ⚠️ Side-by-Side Comparison (needs enhancement)

## 🔧 Required Fixes

### Fix 1: Improve Content Selection Flow

**Changes Needed**:
1. Show collected content prominently before framework selection
2. Allow selecting specific pages from collected data
3. Display content metadata (title, description, word count) before assessment
4. Make it clear content is already collected and ready for analysis

### Fix 2: Verify Framework Definitions Match README

**Action Items**:
1. Verify B2C framework has exactly 30 elements
2. Verify B2B framework has exactly 40 elements
3. Verify Golden Circle has 4 components with 6 dimensions each
4. Verify CliftonStrengths has 34 themes across 4 domains
5. Ensure scoring is flat fractional (0.0-1.0) with no weights

### Fix 3: Sequential Assessment Execution

**Current**: Runs all assessments in parallel
**Required**: Run one assessment at a time when multiple selected
**Reason**: Better progress tracking, clearer results, easier to review

### Fix 4: Enhanced Side-by-Side Comparison

**Current**: Basic comparison view
**Required**: Full strength analysis comparing all frameworks side-by-side
**Features Needed**:
- Compare scores across frameworks
- Highlight strengths and weaknesses
- Show improvement opportunities
- Aggregate recommendations

## 📋 Implementation Plan

### Phase 1: Content Selection Enhancement
- [x] Add content preview card before framework selection ✅
- [x] Show selected pages with metadata ✅
- [x] Allow changing selected content ✅
- [x] Display content statistics (word count, pages, etc.) ✅

### Phase 2: Framework Verification
- [x] Audit all framework JSON files ✅
- [x] Verify element counts match README ✅ (Found mismatches)
- [x] Verify scoring system matches README ✅ (Scoring correct)
- [ ] Update B2C framework (missing 5 elements) ⚠️
- [ ] Update B2B framework (missing 21 elements, wrong structure) ⚠️
- [ ] Create CliftonStrengths framework JSON ⚠️
- [ ] Verify Golden Circle dimensions ⚠️

### Phase 3: Sequential Execution
- [x] Modify FrameworkAnalysisRunner to run one at a time ✅
- [x] Sequential execution implemented ✅
- [ ] Add "Next Assessment" button (optional enhancement)
- [ ] Show queue of pending assessments (optional enhancement)

### Phase 4: Enhanced Comparison View
- [ ] Create side-by-side framework comparison component
- [ ] Aggregate scores across frameworks
- [ ] Generate unified recommendations
- [ ] Export comprehensive comparison report

