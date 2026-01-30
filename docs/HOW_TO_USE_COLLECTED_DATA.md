# How to Use Collected Content Data

## What We're Collecting

The system collects **all of these** automatically:

### ✅ Currently Collected:

1. **JSON-LD Schema Data** - Structured data for SEO
   - Located in: `seo.schemaMarkup`
   - Includes: Organization, WebSite, Service, BreadcrumbList, etc.

2. **GTM/Analytics Tracking** - All tracking codes
   - Located in: `analytics`
   - Includes: GA4 IDs, GTM container IDs, Facebook Pixel, etc.

3. **Actual Page Content** - Clean, visible text
   - Located in: `content.text`
   - Cleaned of Next.js internal data, script tags, etc.

4. **HTML Semantic Tags** - Structure analysis (NEW!)
   - Located in: `tags` or `metadata.htmlTags`
   - Includes: `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`, `<main>`, etc.
   - Counts and details for each semantic tag type

5. **Meta Tags** - All SEO meta tags
   - Located in: `metaTags` or `metadata.metaTags`
   - Includes: title, description, keywords, Open Graph, Twitter Card, etc.

6. **Keywords** - From all sources
   - Located in: `keywords` or `metadata.keywords`
   - Includes: meta keywords, content keywords, heading keywords, alt text keywords

### ❌ What You Saw (Raw HTML)

The raw output you saw includes:
- **Next.js internal data** (`self.__next_f.push`) - This is framework data, NOT collected
- **Script tags** - Excluded from content, but analytics IDs are extracted
- **Style tags** - Excluded from content

## The Clean Data Structure

The system automatically extracts and structures everything into a clean JSON format:

### 1. **Metadata** (Titles, Descriptions, Tags, Keywords)

Located in: `response.metadata` or `comprehensiveData.pages[0].metaTags`

```json
{
  "metadata": {
    "titles": [
      {
        "url": "https://zerobarriers.io",
        "title": "Zero Barriers – Revenue Growth Transformation",
        "ogTitle": "Zero Barriers – Revenue Growth Transformation",
        "twitterTitle": "Zero Barriers – Revenue Growth Transformation"
      }
    ],
    "descriptions": [
      {
        "url": "https://zerobarriers.io",
        "metaDescription": "We dominate revenue growth...",
        "ogDescription": "We dominate revenue growth...",
        "twitterDescription": "We dominate revenue growth..."
      }
    ],
    "metaTags": [
      {
        "url": "https://zerobarriers.io",
        "metaTags": {
          "title": "...",
          "description": "...",
          "keywords": "...",
          "canonical": "...",
          "ogTitle": "...",
          "ogDescription": "...",
          "twitterCard": "..."
        },
        "allMetaTags": [...]
      }
    ],
    "htmlTags": [
      {
        "url": "https://zerobarriers.io",
        "semanticTags": {
          "article": 3,
          "section": 8,
          "nav": 1,
          "header": 1,
          "footer": 1,
          "aside": 0,
          "main": 1,
          "figure": 5,
          "figcaption": 3,
          "time": 0,
          "address": 0,
          "blockquote": 2,
          "details": 0,
          "summary": 0
        },
        "semanticTagDetails": [
          {
            "tag": "article",
            "count": 3,
            "hasId": true,
            "hasClass": true,
            "hasAriaLabel": false
          },
          ...
        ],
        "totalSemanticTags": 25
      }
    ],
    "keywords": [
      {
        "url": "https://zerobarriers.io",
        "metaKeywords": ["revenue", "growth"],
        "contentKeywords": ["revenue", "growth", "transformation"],
        "headingKeywords": ["revenue", "growth"],
        "altTextKeywords": ["logo", "image"],
        "allKeywords": ["revenue", "growth", "transformation", ...],
        "keywordFrequency": {
          "revenue": 45,
          "growth": 32,
          ...
        }
      }
    ],
    "analytics": [
      {
        "url": "https://zerobarriers.io",
        "googleAnalytics4": {
          "measurementIds": ["G-YHS2Y7L3C9"]
        },
        "googleTagManager": {
          "containerIds": ["GTM-WL8K8XK"]
        },
        "facebookPixel": {
          "pixelId": null
        }
      }
    ]
  }
}
```

### 2. **Clean Content Text**

Located in: `comprehensiveData.pages[0].content.text`

This is **clean, visible text only** - no Next.js internal data, no script tags, just the actual content.

```json
{
  "content": {
    "text": "ZERO BARRIERS Home Services Technology Results Contact Begin Transformation POTENTIAL UNLEASHED Transform Your Revenue Growth Rapid. Substantial. Sustainable...",
    "wordCount": 1250,
    "images": [...],
    "links": [...],
    "forms": [...],
    "buttons": [...]
  }
}
```

### 3. **Structured Data (JSON-LD)**

Located in: `comprehensiveData.pages[0].seo.schemaMarkup`

```json
{
  "schemaMarkup": [
    {
      "type": "Organization",
      "content": {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Zero Barriers",
        "url": "https://zerobarriers.io",
        ...
      }
    }
  ]
}
```

## How to Access This Data

### Option 1: From API Response

After running an analysis, the response includes:

```typescript
const response = await fetch('/api/analyze/compare', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://zerobarriers.io' })
});

const data = await response.json();

// Access metadata
const titles = data.metadata.titles;
const descriptions = data.metadata.descriptions;
const keywords = data.metadata.keywords;
const analytics = data.metadata.analytics;

// Access clean content
const cleanText = data.comprehensive.pages[0].content.text;
const wordCount = data.comprehensive.pages[0].content.wordCount;

// Access structured data
const schemaData = data.comprehensive.pages[0].seo.schemaMarkup;
```

### Option 2: From Local Forage (Client-Side)

Data is automatically stored in Local Forage (IndexedDB):

```typescript
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';

// Get stored data
const stored = await UnifiedLocalForageStorage.getPuppeteerData('https://zerobarriers.io');

if (stored) {
  const metadata = stored.metadata;
  const cleanText = stored.data.pages[0].content.text;
  const keywords = stored.data.pages[0].keywords;
}
```

### Option 3: Export and Download

Use the **ContentExporter** component (already integrated):

1. **Copy Metadata** - Copy to clipboard as JSON
2. **Download Metadata JSON** - Download as `.json` file
3. **Download Metadata Markdown** - Download as `.md` file
4. **Download Metadata CSV** - Download as `.csv` file

## Best Format for Analysis

### Recommended: Structured JSON

The collected data is already in the **best format** - structured JSON:

```json
{
  "url": "https://zerobarriers.io",
  "timestamp": "2026-01-28T00:00:00.000Z",
  "pages": [
    {
      "url": "https://zerobarriers.io",
      "title": "Page Title",
      "metaDescription": "Meta description",
      "headings": {
        "h1": ["Main Heading"],
        "h2": ["Subheading 1", "Subheading 2"]
      },
      "metaTags": {
        "title": "...",
        "description": "...",
        "keywords": "...",
        "canonical": "...",
        "ogTitle": "...",
        "ogDescription": "...",
        "twitterCard": "..."
      },
      "keywords": {
        "metaKeywords": ["keyword1", "keyword2"],
        "contentKeywords": ["content", "words"],
        "headingKeywords": ["heading", "words"],
        "altTextKeywords": ["alt", "text"],
        "allKeywords": ["all", "unique", "keywords"],
        "keywordFrequency": {
          "keyword": 5,
          "word": 3
        }
      },
      "analytics": {
        "googleAnalytics4": {
          "measurementIds": ["G-XXXXXXXXXX"]
        },
        "googleTagManager": {
          "containerIds": ["GTM-XXXXX"]
        }
      },
      "content": {
        "text": "Clean visible text content only...",
        "wordCount": 500,
        "images": [...],
        "links": [...]
      }
    }
  ]
}
```

### Why This Format?

1. **Structured** - Easy to parse programmatically
2. **Complete** - All metadata, keywords, analytics in one place
3. **Clean** - No Next.js internal data, no script tags
4. **Reusable** - Can be used for multiple analyses
5. **Exportable** - Easy to export as JSON, Markdown, or CSV

## How to Save Metadata

### Automatic Saving

Metadata is **automatically saved** when content is collected:

1. **Local Forage** (Client-side) - Stored in IndexedDB automatically
2. **Database** (Server-side) - Stored in Prisma if `userId` is provided

### Manual Export

Use the export functions:

```typescript
import {
  exportMetadataAsJSON,
  exportMetadataAsMarkdown,
  exportMetadataAsCSV,
} from '@/lib/utils/metadata-exporter';

// Export as JSON
const json = exportMetadataAsJSON(metadata);
// Save to file or copy to clipboard

// Export as Markdown
const markdown = exportMetadataAsMarkdown(metadata);
// Save to .md file

// Export as CSV
const csv = exportMetadataAsCSV(metadata);
// Save to .csv file
```

## How to Reuse Data

### For Other Analyses

1. **Same URL** - Data is automatically cached and reused
2. **Export JSON** - Download the JSON and upload to other analysis pages
3. **Copy from Local Forage** - Access stored data programmatically

### Example: Reuse for B2C Analysis

```typescript
// 1. Get stored data
const stored = await UnifiedLocalForageStorage.getPuppeteerData(url);

// 2. Use for B2C analysis
const b2cResponse = await fetch('/api/analyze/b2c', {
  method: 'POST',
  body: JSON.stringify({
    url: url,
    comprehensiveData: stored.data // Reuse collected data
  })
});
```

## What Gets Captured

### ✅ Captured (Clean Format)

- **Visible text content** - Clean, readable text
- **Headings** - H1-H6 tags
- **Meta tags** - All SEO meta tags
- **Keywords** - From meta, content, headings, alt text
- **Analytics** - GA4, GTM, Facebook Pixel IDs
- **Structured data** - JSON-LD schema
- **Links** - Internal and external
- **Images** - With alt text
- **Forms** - Form structure
- **Buttons** - CTA buttons

### ❌ Excluded (Not Useful)

- Next.js internal data (`self.__next_f.push`)
- Script tag contents (except analytics IDs)
- Style tag contents
- Hidden elements
- Comments

## Quick Reference

### Get Titles
```typescript
const titles = data.metadata.titles[0];
console.log(titles.title); // "Page Title"
console.log(titles.ogTitle); // "OG Title"
```

### Get Descriptions
```typescript
const descriptions = data.metadata.descriptions[0];
console.log(descriptions.metaDescription); // "Meta description"
console.log(descriptions.ogDescription); // "OG description"
```

### Get Keywords
```typescript
const keywords = data.metadata.keywords[0];
console.log(keywords.allKeywords); // ["keyword1", "keyword2", ...]
console.log(keywords.keywordFrequency); // { "keyword": 5, ... }
```

### Get HTML Semantic Tags
```typescript
const htmlTags = data.metadata.htmlTags[0];
console.log(htmlTags.semanticTags); // { "article": 3, "section": 8, ... }
console.log(htmlTags.totalSemanticTags); // 25
console.log(htmlTags.semanticTagDetails); // Detailed info about each tag type
```

### Get Analytics
```typescript
const analytics = data.metadata.analytics[0];
console.log(analytics.googleAnalytics4.measurementIds); // ["G-XXXXXXXXXX"]
console.log(analytics.googleTagManager.containerIds); // ["GTM-XXXXX"]
```

### Get Clean Content
```typescript
const content = data.comprehensive.pages[0].content;
console.log(content.text); // Clean visible text
console.log(content.wordCount); // Word count
```

## Summary

1. **Data is already structured** - No need to parse raw HTML
2. **Metadata is automatically extracted** - Titles, descriptions, tags, keywords
3. **Content is clean** - No Next.js internal data
4. **Easy to export** - Use ContentExporter component
5. **Easy to reuse** - Stored in Local Forage automatically

The raw output you saw is just the HTML source. The **actual usable data** is in the structured JSON format shown above, which is automatically extracted and stored.

