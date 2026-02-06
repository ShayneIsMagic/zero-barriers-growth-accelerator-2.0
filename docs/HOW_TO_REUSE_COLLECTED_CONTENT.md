# How to Reuse Collected Content for Other Assessments

## 🎯 Overview

Once you've collected content from a website, you can reuse that same content for multiple different assessments without needing to scrape the website again. This saves time and ensures consistency across all your analyses.

---

## 📍 Where to Reuse Collected Content

### Primary Location: Framework Analysis Tab

The easiest way to reuse collected content is through the **Framework Analysis** tab in the Content Comparison page.

**Path**: `/dashboard/content-comparison` → **"Framework Analysis"** tab

---

## 🔄 Step-by-Step: Reusing Collected Content

### Step 1: Collect Content First (If Not Already Done)

1. Go to **Content Comparison** page (`/dashboard/content-comparison`)
2. Enter the website URL
3. Click **"Analyze Existing Content"**
4. Wait for content collection to complete
5. Content is automatically saved to Local Forage

### Step 2: Access Framework Analysis

1. After content is collected, click the **"Framework Analysis"** tab
2. You'll see the Framework Analysis Runner interface

### Step 3: Use Collected Content

1. In **"Step 1: Select Content to Analyze"** section
2. Click the **"Use Collected Content"** button (top-right of the card)
3. A dialog opens showing all your collected content

### Step 4: Select Site and Pages

1. **Browse collected content**:
   - All collected sites are listed by domain
   - Shows page count and collection date
   - Search bar to find specific sites

2. **Select a site**:
   - Click on a site card or click "Select" button
   - You'll see all pages collected from that site

3. **Select specific pages**:
   - Use checkboxes to select which pages to analyze
   - Click "Select All" to choose all pages
   - Expand page details to see metadata

4. **Confirm selection**:
   - Click **"Use Selected Pages"** button
   - Selected pages are loaded into the analysis interface

### Step 5: Run Different Assessments

Now you can run **any assessment** on the selected pages:

1. **Select Assessment Type**:
   - Golden Circle
   - B2C Elements of Value
   - B2B Elements of Value
   - CliftonStrengths
   - Brand Archetypes
   - SEO & Google Tools

2. **Set Assessment Criteria** (Optional but Recommended):
   - Select target archetype
   - Select target audience (B2C/B2B/Both)
   - This ensures consistent comparisons

3. **Run Assessments**:
   - Click "Run Selected Assessments"
   - Each assessment runs on all selected pages
   - Results are generated and stored

---

## 🔁 Reusing for Multiple Assessment Types

### Example: Run All Assessments on Same Content

**Scenario**: You want to analyze the same pages with different frameworks.

1. **First Assessment - Golden Circle**:
   - Use collected content → Select pages
   - Select "Golden Circle" assessment
   - Run assessment
   - Results saved

2. **Second Assessment - B2C Elements**:
   - Use collected content → Select **same pages**
   - Select "B2C Elements of Value" assessment
   - Run assessment
   - Results saved

3. **Third Assessment - CliftonStrengths**:
   - Use collected content → Select **same pages**
   - Select "CliftonStrengths" assessment
   - Run assessment
   - Results saved

**All assessments use the same collected content** - no re-scraping needed!

---

## 🎯 Alternative Methods

### Method 1: Framework Analysis Tab (Recommended)
- **Location**: Content Comparison page → Framework Analysis tab
- **Best for**: Running multiple assessments on selected pages
- **Features**: Page selection, archetype/audience selection, comparison view

### Method 2: Individual Assessment Pages
Some assessment pages have "Load Saved Data" buttons:
- Go to specific assessment page (e.g., `/dashboard/elements-value-b2c`)
- Look for "Load Saved Data" button
- Select URL from dropdown
- Data loads automatically

### Method 3: Automatic Detection
- Enter the same URL you used before
- System checks Local Forage first
- If found, uses saved data instead of scraping

---

## 💡 Benefits of Reusing Content

### 1. **Time Savings**
- ✅ No need to re-scrape websites
- ✅ Instant access to collected data
- ✅ Faster assessment execution

### 2. **Consistency**
- ✅ Same content across all assessments
- ✅ Accurate comparisons between frameworks
- ✅ Consistent metadata and structure

### 3. **Cost Efficiency**
- ✅ No duplicate scraping operations
- ✅ Reduced API calls
- ✅ Better resource utilization

### 4. **Better Comparisons**
- ✅ Compare different frameworks on same content
- ✅ Identify patterns across assessments
- ✅ Track improvements over time

---

## 📊 Real-World Example

### Complete Workflow

**Day 1: Collect Content**
```
1. Go to Content Comparison
2. Enter: https://example.com
3. Click "Analyze Existing Content"
4. Wait for collection (2-3 minutes)
5. Content saved automatically
```

**Day 2: Run Multiple Assessments**
```
1. Go to Framework Analysis tab
2. Click "Use Collected Content"
3. Select example.com
4. Select pages: Home, About, Services

5. Assessment 1: Golden Circle
   - Select "Golden Circle"
   - Set archetype: "The Sage"
   - Set audience: "B2B"
   - Run → Results saved

6. Assessment 2: B2B Elements
   - Same pages already selected
   - Select "B2B Elements of Value"
   - Same archetype/audience
   - Run → Results saved

7. Assessment 3: CliftonStrengths
   - Same pages already selected
   - Select "CliftonStrengths"
   - Same archetype/audience
   - Run → Results saved

8. View Comparison
   - See all 3 assessments side-by-side
   - Compare scores across frameworks
   - Download comparison report
```

**Day 3: Add More Assessments**
```
1. Use same collected content
2. Select same pages
3. Run Brand Archetypes assessment
4. Compare with previous results
```

---

## 🔍 What Content Gets Reused?

When you reuse collected content, you get access to:

### Page Data
- ✅ All pages from the site
- ✅ Page labels (from navigation)
- ✅ Page types (homepage, about, services, etc.)
- ✅ Page URLs

### Metadata Per Page
- ✅ SEO titles (Page Title, OG Title, Twitter Title)
- ✅ Meta descriptions
- ✅ Keywords (meta, content, heading, alt text)
- ✅ Analytics tracking (GA4, GTM, Facebook Pixel)
- ✅ HTML semantic tags
- ✅ All meta tags

### Content
- ✅ Clean text content
- ✅ Word counts
- ✅ Content structure

---

## ⚙️ Advanced: Selective Page Reuse

### Select Specific Pages Only

You don't have to use all collected pages:

1. **Use Collected Content** → Select site
2. **Choose specific pages**:
   - Home page only
   - Home + About pages
   - All service pages
   - Custom selection
3. **Run assessments** on selected pages only

This is useful when:
- You only want to analyze certain pages
- You want to compare specific pages
- You're testing different page types

---

## 🎨 Best Practices

### 1. **Collect Once, Use Many Times**
- Collect content thoroughly the first time
- Reuse for all subsequent assessments
- Saves time and ensures consistency

### 2. **Use Consistent Criteria**
- Set the same archetype/audience for all assessments
- Enables accurate cross-framework comparisons
- Makes results more meaningful

### 3. **Select Relevant Pages**
- Choose pages that serve similar purposes
- Group by audience or function
- Avoid mixing unrelated pages

### 4. **Track Your Assessments**
- Use "View Reports" to see all generated reports
- Compare results across different frameworks
- Track improvements over time

### 5. **Export for Backup**
- Download comparison reports
- Save important assessments
- Keep records of your analysis

---

## 🚨 Troubleshooting

### "No Collected Content Available"
**Solution**:
1. Go to Content Comparison page
2. Enter URL and click "Analyze Existing Content"
3. Wait for collection to complete
4. Then try "Use Collected Content" again

### "Pages Not Showing"
**Solution**:
1. Verify content was collected for that URL
2. Check URL matches exactly (including https://)
3. Try refreshing the collected content list

### "Can't Select Pages"
**Solution**:
1. Make sure you clicked "Select" on a site first
2. Wait for pages to load
3. Check browser console for errors

### "Assessment Uses Old Content"
**Solution**:
1. Re-collect content if website has changed
2. New collection will replace old data
3. Or use version numbers to track changes

---

## 📝 Quick Reference

| Action | How To |
|--------|--------|
| **Access Collected Content** | Framework Analysis tab → "Use Collected Content" button |
| **Select Site** | Click on site card or "Select" button |
| **Select Pages** | Use checkboxes, then "Use Selected Pages" |
| **Run Assessment** | Select assessment type → Click "Run Selected Assessments" |
| **Reuse for Another Assessment** | Select same pages → Choose different assessment → Run |
| **View All Reports** | Click "View Reports" button (anywhere) |

---

## ✅ Summary

**To reuse collected content for other assessments:**

1. ✅ Go to **Framework Analysis** tab
2. ✅ Click **"Use Collected Content"** button
3. ✅ Select site and pages
4. ✅ Choose assessment type
5. ✅ Run assessment
6. ✅ Repeat for other assessments using same content

**Key Benefits:**
- ✅ No re-scraping needed
- ✅ Consistent data across assessments
- ✅ Faster execution
- ✅ Better comparisons
- ✅ Cost efficient

The collected content is stored permanently in your browser until you clear it, so you can reuse it as many times as you need for different assessments!


