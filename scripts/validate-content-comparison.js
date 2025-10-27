#!/usr/bin/env node

/**
 * Content Comparison Page Validation Script
 * Ensures the protected functionality remains intact
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️  Content Comparison Page Protection Validation');
console.log('================================================');

// Files to protect
const protectedFiles = [
  'src/components/analysis/ContentComparisonPage.tsx',
  'src/app/api/analyze/compare/route.ts',
  'src/lib/universal-puppeteer-scraper.ts',
];

// Key functionality to check
const requiredPatterns = {
  'ContentComparisonPage.tsx': [
    'runComparison',
    'copyToClipboard',
    'downloadMarkdown',
    'generateComparisonMarkdown',
    'URL input',
    'Proposed New Content',
    'Analyze Existing Content',
  ],
  'compare/route.ts': [
    'UniversalPuppeteerScraper',
    'generateComparisonReport',
    'analyzeWithGemini',
    'maxDuration',
    'POST',
  ],
  'universal-puppeteer-scraper.ts': [
    'scrapeWebsite',
    'UniversalPuppeteerScraper',
    'export',
  ],
};

let allChecksPassed = true;

protectedFiles.forEach((filePath) => {
  console.log(`\n📁 Checking: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ FILE MISSING: ${filePath}`);
    allChecksPassed = false;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const patterns = requiredPatterns[fileName] || [];

  patterns.forEach((pattern) => {
    if (content.includes(pattern)) {
      console.log(`  ✅ ${pattern}`);
    } else {
      console.log(`  ❌ MISSING: ${pattern}`);
      allChecksPassed = false;
    }
  });
});

// Check for backup files
console.log('\n📦 Checking Backup Files:');
const backupFiles = [
  'src/components/analysis/ContentComparisonPage.tsx.backup',
  'src/app/api/analyze/compare/route.ts.backup',
];

backupFiles.forEach((backupPath) => {
  if (fs.existsSync(backupPath)) {
    console.log(`  ✅ ${backupPath}`);
  } else {
    console.log(`  ❌ MISSING BACKUP: ${backupPath}`);
    allChecksPassed = false;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('✅ ALL CHECKS PASSED - Content Comparison page is protected');
  console.log('🛡️  The golden template is safe and functional');
} else {
  console.log('❌ PROTECTION VIOLATIONS DETECTED');
  console.log('🚨 Content Comparison page may be compromised');
  console.log('🔧 Please restore from backups and fix issues');
}
console.log('='.repeat(50));

process.exit(allChecksPassed ? 0 : 1);
