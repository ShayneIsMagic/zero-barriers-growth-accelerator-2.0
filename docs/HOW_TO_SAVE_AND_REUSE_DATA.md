# How to Save and Reuse Data with Local Forage

## Overview

The app uses **Local Forage** (IndexedDB) to store collected data locally in your browser. This allows you to:

1. **Save** Puppeteer-collected data, metadata, and analysis results
2. **Reuse** the same data across different assessments (B2C, B2B, CliftonStrengths, Golden Circle)
3. **Avoid re-scraping** the same URLs multiple times
4. **Export** data for offline use or sharing

## Where Data is Saved

All data is stored in your browser's **IndexedDB** using Local Forage:

- **Puppeteer Data**: `ZeroBarriers/puppeteer_data` store
- **Reports**: `ZeroBarriers/reports` store
- **Imported Files**: `ZeroBarriers/imported_files` store

Data persists across browser sessions until you clear it.

## How to Save Data

### 1. From Content Comparison Page

After running a content comparison:

1. Click **"Save to Local Forage"** button
2. Select what to save:
   - ✅ **Puppeteer Collected Data** (recommended - includes everything)
   - ✅ **SEO Metadata** (titles, descriptions, tags, keywords, analytics)
   - ✅ **Clean Text Content**
   - ⚪ **AI Analysis Result** (optional)
   - ⚪ **Generated Report** (optional)
3. Click **"Save"**

The data is automatically saved with the URL as the key.

### 2. What Gets Saved

When you save "Puppeteer Collected Data", it includes:

- **All Pages**: Each page with its label (from navbar)
- **Metadata per Page**:
  - SEO Titles (Page Title, OG Title, Twitter Title)
  - Meta Descriptions (Meta, OG, Twitter)
  - Keywords (Meta, Content, Heading, Alt Text, All Keywords)
  - Analytics (GA4 IDs, GTM IDs, Facebook Pixel)
  - HTML Semantic Tags
  - All Meta Tags
- **Content**: Clean text from all pages
- **Structure**: Page hierarchy and relationships

## How to Reuse Data

### 1. Load Saved Data in Content Comparison

1. Click **"Load Saved Data"** button
2. Select a URL from the list
3. Click **"Load Data"**

The page will be pre-populated with the saved data.

### 2. Use Saved Data in Other Assessments

**For B2C, B2B, CliftonStrengths, Golden Circle pages:**

1. Click **"Load Saved Data"** button (if available)
2. Select the URL you saved from Content Comparison
3. The assessment will use the saved Puppeteer data instead of scraping again

**Or manually:**

1. Go to the assessment page (e.g., B2C Elements)
2. Enter the same URL you used in Content Comparison
3. The system will check Local Forage first before scraping

## Data Structure

### Saved Puppeteer Data Structure

```typescript
{
  url: string;
  data: {
    pages: [
      {
        pageLabel: "Home",        // From navbar
        pageType: "homepage",    // Page type
        url: "https://example.com",
        title: "Page Title",
        metaDescription: "...",
        metaTags: { ... },
        keywords: { ... },
        analytics: { ... },
        tags: { ... },           // HTML semantic tags
        content: { text: "...", wordCount: 123 }
      },
      // ... more pages
    ],
    summary: { ... }
  },
  timestamp: "2025-01-28T...",
  metadata: {
    tags: { ... },
    keywords: { ... },
    seo: { ... },
    analytics: { ... }
  }
}
```

## Using Data Across Assessments

### Example Workflow

1. **Content Comparison** → Save Puppeteer data for `https://example.com`
2. **B2C Elements** → Load saved data → Run analysis
3. **B2B Elements** → Load saved data → Run analysis
4. **CliftonStrengths** → Load saved data → Run analysis
5. **Golden Circle** → Load saved data → Run analysis

All assessments use the **same collected data** without re-scraping.

## Storage Limits

Local Forage uses IndexedDB, which typically allows:

- **Chrome/Edge**: ~60% of disk space (can be several GB)
- **Firefox**: ~50% of disk space
- **Safari**: ~1GB by default

For most use cases, this is more than enough.

## Clearing Data

To clear all saved data:

```typescript
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';

await UnifiedLocalForageStorage.clearAll();
```

Or clear browser data manually:
- Chrome: Settings → Privacy → Clear browsing data → IndexedDB
- Firefox: Settings → Privacy → Clear Data → IndexedDB
- Safari: Preferences → Privacy → Manage Website Data

## Best Practices

1. **Save after Content Comparison**: Always save Puppeteer data after a successful collection
2. **Use descriptive URLs**: The URL is the key, so use consistent URLs
3. **Save before analysis**: Save data before running expensive AI analyses
4. **Reuse across assessments**: Load saved data for all framework assessments
5. **Export for backup**: Use ContentExporter to download JSON/Markdown backups

## Troubleshooting

### "No saved data found"

- Make sure you saved data from Content Comparison first
- Check that you're using the same URL
- Verify Local Forage is enabled in your browser

### "Failed to save"

- Check browser console for errors
- Ensure IndexedDB is not disabled
- Try clearing browser cache and retrying

### Data not loading

- Verify the URL matches exactly
- Check browser console for errors
- Try saving again from Content Comparison

## Integration with Other Pages

### Adding DataLoader to Assessment Pages

```tsx
import { DataLoader } from '@/components/shared/DataLoader';

// In your component:
<DataLoader
  currentUrl={url.trim()}
  onDataLoaded={(loadedData) => {
    // Use loadedData.puppeteerData, loadedData.metadata, etc.
    setPuppeteerData(loadedData.puppeteerData);
  }}
/>
```

### Adding DataSaveSelector to Assessment Pages

```tsx
import { DataSaveSelector } from '@/components/shared/DataSaveSelector';

// After getting results:
<DataSaveSelector
  url={url.trim()}
  puppeteerData={puppeteerData}
  metadata={metadata}
  analysisResult={analysisResult}
  assessmentType="b2c-elements"
  onSaved={() => {
    console.log('Saved!');
  }}
/>
```

## Summary

- ✅ **Save** data from Content Comparison using "Save to Local Forage"
- ✅ **Load** saved data using "Load Saved Data" button
- ✅ **Reuse** the same data across all assessment pages
- ✅ **Export** data using ContentExporter for backups
- ✅ Data persists in browser IndexedDB until cleared

This system ensures you only scrape once and reuse the data everywhere!

