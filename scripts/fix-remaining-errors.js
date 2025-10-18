#!/usr/bin/env node

/**
 * Fix Remaining TypeScript Errors
 * Addresses the remaining compilation issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining TypeScript errors...\n');

// 1. Fix competitors variable references in phase1-complete/route.ts
console.log('1. Fixing competitors variable references...');
const phase1CompletePath = path.join(process.cwd(), 'src/app/api/analyze/phase1-complete/route.ts');
if (fs.existsSync(phase1CompletePath)) {
  let content = fs.readFileSync(phase1CompletePath, 'utf8');
  
  // Fix the remaining competitors references
  content = content.replace(/competitors\[/g, '_competitors[');
  content = content.replace(/competitors\./g, '_competitors.');
  content = content.replace(/competitors\)/g, '_competitors)');
  
  fs.writeFileSync(phase1CompletePath, content);
  console.log('  ✅ Fixed competitors references in phase1-complete/route.ts');
}

// 2. Fix WebsiteAnalysisRequest import issue
console.log('\n2. Fixing WebsiteAnalysisRequest import...');
const websiteRoutePath = path.join(process.cwd(), 'src/app/api/analyze/website/route.ts');
if (fs.existsSync(websiteRoutePath)) {
  let content = fs.readFileSync(websiteRoutePath, 'utf8');
  
  // Fix the import
  content = content.replace(
    /import { _WebsiteAnalysisRequest, _WebsiteAnalysisResult } from '@\/types\/analysis';/,
    'import { WebsiteAnalysisRequest, WebsiteAnalysisResult } from \'@/types/analysis\';'
  );
  
  fs.writeFileSync(websiteRoutePath, content);
  console.log('  ✅ Fixed WebsiteAnalysisRequest import');
}

// 3. Fix test-helpers.tsx callable type issue
console.log('\n3. Fixing test-helpers.tsx callable type...');
const testHelpersPath = path.join(process.cwd(), 'src/test/utils/test-helpers.tsx');
if (fs.existsSync(testHelpersPath)) {
  let content = fs.readFileSync(testHelpersPath, 'utf8');
  
  // Fix the callable type issue
  content = content.replace(
    /\(global\.localStorage\.setItem as unknown\)\(/g,
    '(global.localStorage.setItem as any)('
  );
  
  fs.writeFileSync(testHelpersPath, content);
  console.log('  ✅ Fixed test-helpers.tsx callable type');
}

// 4. Fix MarkdownReportGenerator imports in test files
console.log('\n4. Fixing MarkdownReportGenerator imports...');
const testFiles = [
  'test-markdown-execution.ts',
  'test-markdown-supabase-execution.ts'
];

testFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add proper import if missing
    if (content.includes('MarkdownReportGenerator.') && !content.includes('import { MarkdownReportGenerator }')) {
      const importMatch = content.match(/^import.*from.*['"]/m);
      if (importMatch) {
        const insertIndex = content.indexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, insertIndex) + '\nimport { MarkdownReportGenerator } from \'./src/lib/markdown-report-generator\';' + content.slice(insertIndex);
      } else {
        content = "import { MarkdownReportGenerator } from './src/lib/markdown-report-generator';\n" + content;
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed MarkdownReportGenerator import in ${file}`);
  }
});

console.log('\n🎉 Remaining error fixes completed!');
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. If successful, commit and push to GitHub');
console.log('3. Deploy to Vercel');
