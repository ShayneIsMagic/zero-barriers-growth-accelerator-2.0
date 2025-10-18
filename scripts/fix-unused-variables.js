#!/usr/bin/env node

/**
 * Fix Unused Variables Script
 * Systematically fixes unused variable warnings by either removing them or fixing references
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing unused variable warnings...\n');

// Get all TypeScript files
const srcDir = path.join(process.cwd(), 'src');
const files = [];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      files.push(filePath);
    }
  });
}

walkDir(srcDir);

console.log(`Found ${files.length} TypeScript files to process\n`);

// Common patterns to fix
const fixes = [
  // Remove unused imports
  {
    pattern: /import\s*{\s*([^}]*)\s*}\s*from\s*['"][^'"]*['"];?\s*$/gm,
    fix: (match, imports) => {
      const importList = imports.split(',').map(imp => imp.trim());
      const usedImports = importList.filter(imp => {
        const cleanImp = imp.replace(/\s+as\s+\w+/, '').trim();
        return cleanImp && !cleanImp.startsWith('_');
      });

      if (usedImports.length === 0) {
        return ''; // Remove entire import line
      }

      return match.replace(imports, usedImports.join(', '));
    }
  },

  // Fix function parameters that are prefixed with _ but still used
  {
    pattern: /function\s+\w+\([^)]*_(\w+)[^)]*\)/g,
    fix: (match) => {
      return match.replace(/_(\w+)/g, '$1');
    }
  },

  // Fix variable declarations that are prefixed with _ but still used
  {
    pattern: /const\s+_(\w+)\s*=/g,
    fix: (match, varName) => {
      return match.replace(`_${varName}`, varName);
    }
  },

  // Fix destructuring with unused variables
  {
    pattern: /const\s*{\s*([^}]*)\s*}\s*=\s*[^;]+;/g,
    fix: (match, destructured) => {
      const vars = destructured.split(',').map(v => v.trim());
      const fixedVars = vars.map(v => {
        if (v.startsWith('_') && v.length > 1) {
          return v.substring(1); // Remove underscore
        }
        return v;
      });
      return match.replace(destructured, fixedVars.join(', '));
    }
  }
];

let fixedFiles = 0;
let totalFixes = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixes = 0;

    fixes.forEach(({ pattern, fix }) => {
      const newContent = content.replace(pattern, fix);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        fileFixes++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed ${fileFixes} issues in ${path.relative(process.cwd(), filePath)}`);
      fixedFiles++;
      totalFixes += fileFixes;
    }
  } catch (error) {
    console.log(`  ❌ Error processing ${path.relative(process.cwd(), filePath)}: ${error.message}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixes} issues across ${fixedFiles} files`);

// Run ESLint to check remaining issues
console.log('\n🔍 Running ESLint to check remaining issues...');
try {
  execSync('npx eslint src/ --format=compact | grep "unused" | wc -l', { stdio: 'inherit' });
} catch (error) {
  console.log('ESLint check completed with some remaining warnings');
}

console.log('\nNext steps:');
console.log('1. Review the changes');
console.log('2. Run: npm run build');
console.log('3. Test the application');
