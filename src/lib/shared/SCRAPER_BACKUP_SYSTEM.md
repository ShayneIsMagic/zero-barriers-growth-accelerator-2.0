# Scraper Backup System Documentation

## Overview
The standardized data collection system includes a robust backup mechanism to ensure reliable data collection across all assessment frameworks.

## Architecture

### Primary Scraper
- **Tool**: `UniversalPuppeteerScraper`
- **Method**: `scrapeWebsite(url)`
- **Purpose**: Primary data collection using the same approach as content-comparison page
- **Error Handling**: Standard error propagation

### Backup Scraper
- **Tool**: `UniversalPuppeteerScraper` (same tool, different error handling)
- **Method**: `backupScrapeWebsite(url)`
- **Purpose**: Fallback when primary scraper fails
- **Features**:
  - Retry logic with exponential backoff
  - Maximum 2 retry attempts
  - Progressive delay (1s, 2s)
  - Detailed error logging

## Data Flow

```
URL Input
    ↓
Primary Scraper (UniversalPuppeteerScraper)
    ↓ (if fails)
Backup Scraper (UniversalPuppeteerScraper + retry logic)
    ↓ (if fails)
Error: "Data collection failed"
    ↓ (if succeeds)
Transform to Standardized Format
    ↓
Return StandardizedWebsiteData
```

## Error Handling Strategy

### Primary Failure
- Log warning with error details
- Automatically trigger backup scraper
- No user interruption

### Backup Failure
- Log error with both primary and backup error details
- Throw comprehensive error message
- User sees clear failure reason

### Success
- Transform data to standardized format
- Log success metrics (word count, keywords)
- Return structured data

## Benefits

1. **Reliability**: Double redundancy for critical data collection
2. **Transparency**: Clear logging of which scraper succeeded
3. **Consistency**: Same data format regardless of which scraper is used
4. **Debugging**: Detailed error information for troubleshooting
5. **Performance**: Primary scraper is fast, backup only used when needed

## Usage in Assessment Frameworks

All assessment frameworks (B2C, B2B, Golden Circle, CliftonStrengths, etc.) use this standardized approach:

```typescript
// Step 1: Collect standardized website data
const existingData = await StandardizedDataCollector.collectWebsiteData(url);

// Step 2: Process proposed content (if provided)
let proposedData = null;
if (proposedContent && proposedContent.trim().length > 0) {
  proposedData = StandardizedDataCollector.processProposedContent(proposedContent);
}

// Step 3: Generate framework-specific analysis
const prompt = StandardizedDataCollector.generateAssessmentPrompt(
  FRAMEWORK.name,
  FRAMEWORK.description,
  FRAMEWORK.elements,
  FRAMEWORK.categories,
  existingData,
  proposedData
);
```

## Monitoring and Logs

The system provides comprehensive logging:

- `🔍 Collecting standardized data for: {url}` - Start of collection
- `✅ Collected standardized data: {wordCount} words, {keywordCount} keywords` - Success
- `⚠️ Primary scraper failed, trying backup: {error}` - Primary failure
- `🔄 Attempting backup scrape for: {url}` - Backup start
- `🔄 Backup attempt {attempt}/{maxRetries}` - Backup retry
- `❌ Both primary and backup scrapers failed` - Complete failure

## Future Enhancements

1. **Multiple Backup Scrapers**: Add different scraping tools as additional backups
2. **Caching**: Cache successful scrapes to reduce API calls
3. **Health Monitoring**: Track scraper success rates
4. **Dynamic Retry Logic**: Adjust retry attempts based on error type
5. **Fallback Data Sources**: Use alternative data sources when scraping fails

## Integration with Content-Comparison

This system maintains full compatibility with the content-comparison page approach while adding reliability through backup mechanisms. The same `UniversalPuppeteerScraper` is used, ensuring consistency across the application.
