# Using Collected Content for Assessments

## Overview

This guide explains how to use collected content from view reports to run assessments on specific pages, ensuring consistent archetype and audience targeting for accurate comparisons.

## Features

### 1. **Collected Content Viewer**
Browse and select collected content (puppeteer_data) stored in Local Forage.

### 2. **Page Selection**
Select specific pages from collected content to analyze.

### 3. **Archetype & Audience Selection**
Ensure all selected pages are analyzed using the same archetype and audience criteria for consistent comparisons.

### 4. **Page Comparison View**
Compare assessment results across multiple pages side-by-side.

---

## How to Use

### Step 1: Access Collected Content

1. Navigate to the **Framework Analysis** page
2. Click the **"Use Collected Content"** button in the content selection section
3. Browse all collected content organized by domain
4. Select a site to view its collected pages

### Step 2: Select Pages

1. After selecting a site, you'll see all collected pages
2. Use the **MultiPageSelector** to:
   - Select individual pages (checkboxes)
   - Select all pages at once
   - View page metadata (title, description, keywords, analytics, etc.)
   - Expand page details to see full metadata

### Step 3: Set Archetype & Audience (Optional but Recommended)

**Why this matters:**
- Ensures all pages are analyzed using the same criteria
- Enables accurate comparisons between pages
- Maintains consistency in assessment results

**How to set:**

1. In the **"Target Archetype & Audience"** section:
   - **Target Archetype**: Select from 12 Jambojon archetypes:
     - The Sage
     - The Explorer
     - The Hero
     - The Outlaw
     - The Magician
     - The Regular Guy/Girl
     - The Jester
     - The Caregiver
     - The Creator
     - The Innocent
     - The Lover
     - The Ruler
   - **Target Audience**: Select:
     - B2C (Business to Consumer)
     - B2B (Business to Business)
     - Both B2C and B2B

2. If left as "Auto-detect", the system will automatically determine the archetype and audience for each page, which may lead to inconsistent comparisons.

### Step 4: Select Assessments

1. Choose which framework assessments to run:
   - Golden Circle
   - B2C Elements of Value
   - B2B Elements of Value
   - CliftonStrengths
   - SEO & Google Tools
   - Brand Archetypes

2. You can select multiple assessments to run on all selected pages.

### Step 5: Run Assessments

1. Click **"Run Selected Assessments"**
2. The system will:
   - Run each assessment on each selected page
   - Use the selected archetype and audience (if specified)
   - Show progress for each assessment
   - Generate reports for each page-assessment combination

### Step 6: View Comparisons

After assessments complete:

1. **Comparison View** (when 2+ pages are analyzed):
   - Overview tab: Compare scores across all assessments
   - Individual assessment tabs: Detailed comparison for each assessment type
   - Score rankings: See which pages perform best
   - Average, highest, and lowest scores

2. **Individual Reports**:
   - View detailed analysis for each page
   - Download or copy individual reports
   - See validation scores and recommendations

---

## Comparison Features

### Score Comparison
- Visual ranking of pages by score
- Trend indicators (up/down/same)
- Color-coded badges (green/yellow/red)
- Average, highest, and lowest scores

### Side-by-Side Analysis
- Compare validation results
- Compare key findings
- Compare recommendations
- See missing elements across pages

### Export Options
- **Download Comparison**: Export full comparison as JSON
- **Copy Comparison**: Copy summary to clipboard
- **Individual Reports**: Download or copy each report separately

---

## Best Practices

### 1. **Always Set Archetype & Audience for Comparisons**
When comparing multiple pages, always set the same archetype and audience to ensure:
- Consistent scoring criteria
- Accurate comparisons
- Meaningful insights

### 2. **Select Relevant Pages**
- Choose pages that serve similar purposes
- Group pages by audience or function
- Avoid mixing unrelated pages in comparisons

### 3. **Use Multiple Assessments**
- Run multiple framework assessments for comprehensive analysis
- Compare how pages perform across different frameworks
- Identify patterns and gaps

### 4. **Review Comparison View**
- Use the comparison view to identify top performers
- Look for patterns in high/low scores
- Focus recommendations on pages with lower scores

---

## Technical Details

### Data Storage
- Collected content is stored in Local Forage (IndexedDB)
- Key: Site URL
- Contains: All pages, metadata, SEO data, analytics

### Assessment Flow
1. User selects pages from collected content
2. User sets archetype and audience (optional)
3. User selects assessments to run
4. System runs assessments sequentially:
   - For each assessment type
   - For each selected page
   - Using selected archetype/audience in prompts
5. Results stored in Local Forage
6. Comparison view generated automatically

### API Integration
- Assessment API (`/api/analyze/enhanced`) accepts:
  - `selectedArchetype`: Target archetype name
  - `selectedAudience`: 'b2c', 'b2b', or 'both'
- These are included in the AI prompt for consistent analysis

---

## Troubleshooting

### No Collected Content Available
- **Solution**: Go to "Side-by-Side Comparison" tab and collect content first
- Click "Analyze Existing Content" to scrape and store content

### Pages Not Showing
- **Solution**: Ensure content was collected for the site URL
- Check that the URL matches exactly (including protocol)

### Inconsistent Comparison Results
- **Solution**: Always set the same archetype and audience for all pages
- Don't mix "Auto-detect" with specific selections

### Assessment Fails
- **Solution**: Check that page data exists in Local Forage
- Verify the page URL is correct
- Check browser console for error details

---

## Example Workflow

1. **Collect Content**:
   - Go to "Side-by-Side Comparison"
   - Enter URL: `https://example.com`
   - Click "Analyze Existing Content"
   - Wait for collection to complete

2. **Select Pages**:
   - Go to "Framework Analysis" tab
   - Click "Use Collected Content"
   - Select `example.com`
   - Choose pages: Home, About, Services, Contact

3. **Set Criteria**:
   - Target Archetype: "The Sage"
   - Target Audience: "B2B"

4. **Run Assessments**:
   - Select: Golden Circle, B2B Elements, Brand Archetypes
   - Click "Run Selected Assessments"

5. **Review Comparison**:
   - View comparison overview
   - See which pages score highest
   - Review recommendations
   - Download comparison report

---

## Summary

The new collected content workflow enables:
- ✅ Easy access to previously collected content
- ✅ Selective page analysis
- ✅ Consistent archetype/audience targeting
- ✅ Side-by-side page comparisons
- ✅ Comprehensive assessment across multiple frameworks

This ensures you can manage large volumes of collected content and run targeted assessments with consistent criteria for accurate comparisons.


