#!/usr/bin/env node

/**
 * Fix Critical Unused Variables
 * Focus on the most critical unused variable issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing critical unused variable issues...\n');

// Critical files with unused variable issues
const criticalFiles = [
  'src/app/api/analyze/phase1-complete/route.ts',
  'src/app/api/generate-evaluation-guide/route.ts',
  'src/app/api/generate-executive-report/route.ts',
  'src/app/api/reports/stats/route.ts',
  'src/app/api/test-db/route.ts',
  'src/app/api/test-prisma-simple/route.ts',
  'src/app/api/test-simple/route.ts',
  'src/app/api/trpc/[trpc]/route.ts',
  'src/app/dashboard/analyze/page.tsx',
  'src/app/dashboard/phase3/page.tsx',
  'src/app/dashboard/reports/page.tsx'
];

let fixedFiles = 0;
let totalFixes = 0;

criticalFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    let fileFixes = 0;

    // Fix unused function parameters
    content = content.replace(/(\w+)\s*:\s*NextRequest\)/g, (match, param) => {
      if (param === 'request') {
        fileFixes++;
        modified = true;
        return `_${param}: NextRequest)`;
      }
      return match;
    });

    // Fix unused imports
    content = content.replace(/import\s*{\s*([^}]*)\s*}\s*from\s*['"][^'"]*['"];?\s*$/gm, (match, imports) => {
      const importList = imports.split(',').map(imp => imp.trim());
      const unusedImports = importList.filter(imp => {
        const cleanImp = imp.replace(/\s+as\s+\w+/, '').trim();
        return cleanImp && cleanImp.startsWith('_');
      });

      if (unusedImports.length > 0) {
        const usedImports = importList.filter(imp => {
          const cleanImp = imp.replace(/\s+as\s+\w+/, '').trim();
          return cleanImp && !cleanImp.startsWith('_');
        });

        if (usedImports.length === 0) {
          fileFixes++;
          modified = true;
          return ''; // Remove entire import line
        } else {
          fileFixes++;
          modified = true;
          return match.replace(imports, usedImports.join(', '));
        }
      }

      return match;
    });

    // Fix unused variable declarations
    content = content.replace(/const\s+(\w+)\s*=\s*[^;]+;\s*$/gm, (match, varName) => {
      // Check if variable is used elsewhere in the file
      const varUsage = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = content.match(varUsage);

      if (matches && matches.length === 1) {
        // Variable is only declared, never used
        fileFixes++;
        modified = true;
        return ''; // Remove the line
      }

      return match;
    });

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`  ✅ Fixed ${fileFixes} issues in ${filePath}`);
      fixedFiles++;
      totalFixes += fileFixes;
    } else {
      console.log(`  ⏭️  No issues found in ${filePath}`);
    }

  } catch (error) {
    console.log(`  ❌ Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixes} issues across ${fixedFiles} files`);

// Run a quick ESLint check
console.log('\n🔍 Running ESLint check...');
try {
  const result = execSync('npx eslint src/app/api/ --format=compact | grep "unused" | wc -l', {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(`Remaining unused variable warnings in API routes: ${result.trim()}`);
} catch (error) {
  console.log('ESLint check completed');
}

console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. Test critical functionality');
console.log('3. Address remaining warnings if needed');
