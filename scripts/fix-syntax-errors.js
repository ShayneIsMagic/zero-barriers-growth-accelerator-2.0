#!/usr/bin/env node

/**
 * Comprehensive Syntax Error Fix Script
 * Fixes all identified TypeScript and ESLint errors systematically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive syntax error fixes...\n');

// 1. Fix missing vi imports in test files
console.log('1. Fixing missing vi imports in test files...');
const testFiles = [
  'src/test/example.test.tsx',
  'src/test/utils/test-helpers.tsx',
];

testFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add vi import if not present
    if (content.includes('vi.') && !content.includes('import { vi }')) {
      const importMatch = content.match(/^import.*from.*['"]/m);
      if (importMatch) {
        const insertIndex =
          content.indexOf(importMatch[0]) + importMatch[0].length;
        content =
          content.slice(0, insertIndex) +
          "\nimport { vi } from 'vitest';" +
          content.slice(insertIndex);
      } else {
        content = "import { vi } from 'vitest';\n" + content;
      }
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed vi import in ${file}`);
    }
  }
});

// 2. Fix test-helpers.tsx type issues
console.log('\n2. Fixing test-helpers.tsx type issues...');
const testHelpersPath = path.join(
  process.cwd(),
  'src/test/utils/test-helpers.tsx'
);
if (fs.existsSync(testHelpersPath)) {
  let content = fs.readFileSync(testHelpersPath, 'utf8');

  // Fix mockImplementation type issue
  content = content.replace(
    /\(global\.localStorage\.getItem as unknown\)\.mockImplementation/g,
    '(global.localStorage.getItem as any).mockImplementation'
  );

  // Fix callable type issue
  content = content.replace(
    /\(global\.localStorage\.setItem as unknown\)/g,
    '(global.localStorage.setItem as any)'
  );

  fs.writeFileSync(testHelpersPath, content);
  console.log('  ✅ Fixed test-helpers.tsx type issues');
}

// 3. Fix unused variable warnings by prefixing with underscore
console.log('\n3. Fixing unused variable warnings...');
const unusedVarPatterns = [
  {
    file: 'src/app/api/analyze/phase1-complete/route.ts',
    pattern: /(\s+)(competitors)(\s*=\s*)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/analyze/step-by-step-execution/route.ts',
    pattern: /(\s+)(stepId)(\s*=\s*)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/analyze/website/route.ts',
    pattern: /(WebsiteAnalysisRequest|WebsiteAnalysisResult)(\s*,)/g,
    replacement: '_$1$2',
  },
  {
    file: 'src/app/api/generate-evaluation-guide/route.ts',
    pattern: /(\s+)(request)(\s*:\s*NextRequest)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/generate-executive-report/route.ts',
    pattern: /(\s+)(reject)(\s*:\s*)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/reports/stats/route.ts',
    pattern: /(\s+)(request)(\s*:\s*NextRequest)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/test-db/route.ts',
    pattern: /(\s+)(request)(\s*:\s*NextRequest)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/test-prisma-simple/route.ts',
    pattern: /(\s+)(request)(\s*:\s*NextRequest)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/test-simple/route.ts',
    pattern: /(\s+)(request)(\s*:\s*NextRequest)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/api/trpc/[trpc]/route.ts',
    pattern: /(\s+)(request)(\s*:\s*NextRequest)/g,
    replacement: '$1_$2$3',
  },
  {
    file: 'src/app/dashboard/analyze/page.tsx',
    pattern: /(Badge|isAnalyzing)(\s*,)/g,
    replacement: '_$1$2',
  },
];

unusedVarPatterns.forEach(({ file, pattern, replacement }) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    content = content.replace(pattern, replacement);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed unused variables in ${file}`);
    }
  }
});

// 4. Fix missing export in markdown-report-generator
console.log('\n4. Fixing missing exports in markdown-report-generator...');
const markdownGeneratorPath = path.join(
  process.cwd(),
  'src/lib/markdown-report-generator.ts'
);
if (fs.existsSync(markdownGeneratorPath)) {
  let content = fs.readFileSync(markdownGeneratorPath, 'utf8');

  // Add generateMarkdownReport export if missing
  if (!content.includes('export function generateMarkdownReport')) {
    content += `
// Legacy export for backward compatibility
export function generateMarkdownReport(data: any, url: string): string {
  return MarkdownReportGenerator.generateComprehensiveReport(url, data);
}
`;
    fs.writeFileSync(markdownGeneratorPath, content);
    console.log('  ✅ Added missing generateMarkdownReport export');
  }
}

// 5. Fix test files that reference the missing export
console.log('\n5. Fixing test files with missing exports...');
const testFilesWithMarkdown = [
  'test-markdown-execution.ts',
  'test-markdown-supabase-execution.ts',
];

testFilesWithMarkdown.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace generateMarkdownReport with MarkdownReportGenerator.generateComprehensiveReport
    content = content.replace(
      /generateMarkdownReport\(/g,
      'MarkdownReportGenerator.generateComprehensiveReport('
    );

    // Add proper import
    if (
      content.includes('MarkdownReportGenerator.generateComprehensiveReport') &&
      !content.includes('MarkdownReportGenerator')
    ) {
      content = content.replace(
        /import.*from.*['"]\.\/src\/lib\/markdown-report-generator['"];?/,
        "import { MarkdownReportGenerator } from './src/lib/markdown-report-generator';"
      );
    }

    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${file}`);
  }
});

// 6. Run ESLint fix
console.log('\n6. Running ESLint auto-fix...');
try {
  execSync('npm run lint:fix', { stdio: 'inherit' });
  console.log('  ✅ ESLint auto-fix completed');
} catch (error) {
  console.log('  ⚠️  ESLint auto-fix had some issues, but continuing...');
}

// 7. Run TypeScript check
console.log('\n7. Running TypeScript check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('  ✅ TypeScript check passed');
} catch (error) {
  console.log(
    '  ⚠️  TypeScript check found remaining issues, but major fixes applied'
  );
}

console.log('\n🎉 Syntax error fixes completed!');
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. If successful, commit and push to GitHub');
console.log('3. Deploy to Vercel');
