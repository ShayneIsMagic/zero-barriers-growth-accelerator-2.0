# Brand Archetypes Assessment - Integration Guide

## ✅ Integration Complete

The **Jambojon Brand Archetypes** assessment has been fully integrated into the Framework Analysis system.

---

## 📍 Location in System

### 1. Framework Knowledge File
**Path**: `src/lib/ai-engines/framework-knowledge/jambojon-archetypes-framework.json`

**Contains**:
- Complete definitions of all 12 archetypes
- Keyword signals for each archetype
- "As the Guide" value delivery patterns
- Revenue impact and pricing potential
- Analysis methodology

**The 12 Archetypes**:
1. The Sage - Wisdom, knowledge, mentorship
2. The Explorer - Freedom, adventure, discovery
3. The Hero - Courage, strength, determination
4. The Outlaw - Rebellion, disruption, freedom
5. The Magician - Transformation, vision, innovation
6. The Regular Guy/Girl - Belonging, relatability, authenticity
7. The Jester - Joy, humor, entertainment
8. The Caregiver - Compassion, empathy, help
9. The Creator - Innovation, artistry, expression
10. The Innocent - Optimism, simplicity, purity
11. The Lover - Passion, sensuality, connection
12. The Ruler - Authority, control, leadership

---

### 2. Assessment Rules File
**Path**: `src/lib/ai-engines/assessment-rules/jambojon-archetypes-rules.json`

**Contains**:
- Assessment persona and task definition
- Context template for AI prompts
- Scoring methodology (flat fractional 0.0-1.0)
- Expected JSON output format
- Success criteria

---

### 3. UI Component Integration
**Path**: `src/components/analysis/FrameworkAnalysisRunner.tsx`

**Changes Made**:
- Added "Brand Archetypes" to `AVAILABLE_ASSESSMENTS` array
- Assessment ID: `brand-archetypes`
- Assessment Type: `jambojon-archetypes`
- Icon: `Sparkles` (from lucide-react)

**User Experience**:
- Appears in the assessment selection list
- Can be selected alongside other frameworks
- Runs sequentially with other assessments
- Shows progress and results in real-time

---

### 4. Framework Integration Service
**Path**: `src/lib/ai-engines/framework-integration.service.ts`

**Changes Made**:
- Added `jambojon-archetypes` to framework name mapping
- Added `brand-archetypes` alias
- Framework knowledge will be loaded automatically
- Assessment rules will be applied during analysis

---

## 🎯 How to Use

### Step-by-Step Process:

1. **Collect Content**
   - Go to Content Comparison page
   - Enter a website URL
   - Click "Analyze" to collect content

2. **Navigate to Framework Analysis**
   - Click on "Framework Analysis" tab
   - This appears after content is collected

3. **Select Pages**
   - Step 1: Select which pages to analyze
   - Use checkboxes to select specific pages
   - Or use "Select All" for all pages

4. **Select Assessments**
   - Step 2: Select Framework Assessments
   - Check "Brand Archetypes" checkbox
   - Can select multiple assessments

5. **Run Analysis**
   - Click "Run Selected Assessments"
   - Analysis runs sequentially (one at a time)
   - Progress bars show real-time status

6. **Review Results**
   - Reports appear as each assessment completes
   - View, Download, or Copy each report
   - Reports are auto-saved to Local Forage

---

## 📊 What the Assessment Provides

### Analysis Output:

1. **Archetype Scores** (0.0-1.0 for each of 12 archetypes)
   - Keyword presence evidence
   - Thematic alignment assessment
   - Value delivery patterns

2. **Primary Archetype Identification**
   - Highest scoring archetype
   - Evidence and justification
   - Strength rating (Dominant/Strong/Moderate/Weak)

3. **Secondary Archetypes**
   - Supporting archetypes (0.5-0.79 scores)
   - How they complement primary archetype

4. **Brand Identity Assessment**
   - Archetype consistency
   - Tone alignment
   - Narrative strength
   - Customer connection potential

5. **Recommendations**
   - Priority-based recommendations
   - Action steps for each recommendation
   - Expected impact on brand identity

---

## 🔄 Integration with Other Systems

### Works With:
- ✅ **Content Collection** - Uses scraped website content
- ✅ **Multi-Page Selection** - Can analyze multiple pages
- ✅ **Enhanced Analysis Service** - Uses framework knowledge
- ✅ **Local Forage Storage** - Auto-saves reports
- ✅ **Reports Viewer** - Displays results with view/download/copy

### Framework Compatibility:
- Can run alongside:
  - Golden Circle
  - B2C Elements of Value
  - B2B Elements of Value
  - CliftonStrengths
  - SEO & Google Tools

---

## 📝 Scoring Methodology

### Flat Fractional Scoring (0.0-1.0)

**All 12 archetypes count equally** - no weights applied.

**Scoring Factors**:
1. **Keyword Presence (40%)**
   - Exact keyword matches from framework
   - Synonym and thematic matches
   - Frequency and prominence

2. **Thematic Alignment (30%)**
   - Match with archetype definition
   - Core characteristics presence
   - Value delivery patterns

3. **Value Delivery (30%)**
   - "As the Guide" assistance patterns
   - Archetype-specific benefits
   - Tone consistency

**Scoring Scale**:
- **0.8-1.0** - Dominant (Primary archetype, clearly present)
- **0.6-0.79** - Strong (Secondary archetype, well-represented)
- **0.4-0.59** - Moderate (Present but not primary)
- **0.0-0.39** - Weak/Absent (Not present or minimal)

---

## 🚀 Future Enhancements

### Potential Additions:
1. **Before/After Comparison**
   - Compare existing vs. proposed content
   - Measure archetype shifts
   - Calculate deltas for each archetype

2. **Archetype Combination Analysis**
   - Identify hybrid archetype profiles
   - Assess synergy between archetypes
   - Recommend optimal combinations

3. **Competitive Archetype Analysis**
   - Compare brand archetypes to competitors
   - Identify differentiation opportunities
   - Assess market positioning

4. **Archetype-Driven Content Recommendations**
   - Generate content suggestions based on archetype
   - Provide archetype-consistent messaging
   - Create archetype-specific CTAs

---

## ✅ Verification Checklist

- [x] Framework knowledge file created
- [x] Assessment rules file created
- [x] UI component updated
- [x] Framework integration service updated
- [x] Icon import added
- [x] Assessment appears in selection list
- [x] No linter errors
- [x] Follows flat fractional scoring (0.0-1.0)
- [x] All 12 archetypes defined
- [x] Documentation complete

---

## 📚 Related Documentation

- `docs/frameworks/jambojon-exact-framework.md` - Complete framework definitions
- `docs/JAMBOJON_ARCHETYPES_ENHANCED.md` - Enhanced framework with synonyms
- `docs/frameworks/jambojon-exact-prompts.md` - AI prompt templates

---

**Status**: ✅ **Fully Integrated and Ready to Use**

The Brand Archetypes assessment is now available in the Framework Analysis tab and can be used alongside all other framework assessments.


