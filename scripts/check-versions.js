#!/usr/bin/env node

/**
 * Version Check Script
 * Checks for outdated packages before installation
 * Prevents installing outdated packages without awareness
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

// Critical packages that should be checked
const CRITICAL_PACKAGES = [
  'react',
  'react-dom',
  'next',
  'prisma',
  '@prisma/client',
  'puppeteer',
  'puppeteer-core',
  '@tanstack/react-query',
  '@trpc/client',
  '@trpc/server',
  'zod',
  'tailwindcss',
];

function checkOutdated() {
  console.log('🔍 Checking for outdated packages...\n');

  try {
    // Check outdated packages
    const outdated = execSync('npm outdated --json', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const packages = JSON.parse(outdated);
    const packageNames = Object.keys(packages);

    if (packageNames.length === 0) {
      console.log('✅ All packages are up to date!');
      return { outdated: [], critical: [] };
    }

    console.log(`⚠️  Found ${packageNames.length} outdated package(s):\n`);

    const critical = [];
    const others = [];

    packageNames.forEach(pkg => {
      const info = packages[pkg];
      const current = info.current;
      const latest = info.latest;
      const wanted = info.wanted || latest;

      // Check if it's a major version update
      const currentMajor = current.split('.')[0];
      const latestMajor = latest.split('.')[0];
      const isMajor = currentMajor !== latestMajor;
      const isCritical = CRITICAL_PACKAGES.some(cp => pkg.includes(cp));

      const status = isMajor ? '🔴 MAJOR' : isCritical ? '🟡 MINOR' : '🟢 PATCH';
      
      console.log(`${status} ${pkg}`);
      console.log(`   Current: ${current} → Latest: ${latest} (Wanted: ${wanted})`);

      if (isCritical || isMajor) {
        critical.push({ pkg, current, latest, wanted, isMajor });
      } else {
        others.push({ pkg, current, latest, wanted });
      }
      console.log('');
    });

    if (critical.length > 0) {
      console.log('\n🚨 CRITICAL UPDATES AVAILABLE:\n');
      critical.forEach(({ pkg, current, latest, isMajor }) => {
        console.log(`   ${isMajor ? '🔴' : '🟡'} ${pkg}: ${current} → ${latest}`);
      });
      console.log('\n⚠️  These updates may have breaking changes. Review before updating.\n');
    }

    return { outdated: packageNames, critical };
  } catch (error) {
    // npm outdated returns non-zero exit code when packages are outdated
    // This is expected behavior
    if (error.status === 1) {
      // Parse the output anyway
      try {
        const output = error.stdout || error.stderr || '';
        if (output.trim()) {
          const packages = JSON.parse(output);
          return { outdated: Object.keys(packages), critical: [] };
        }
      } catch {
        // Ignore parse errors
      }
    }
    return { outdated: [], critical: [] };
  }
}

function checkSecurity() {
  console.log('🔒 Checking for security vulnerabilities...\n');
  
  try {
    execSync('npm audit --json', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ No known security vulnerabilities found.\n');
  } catch (error) {
    try {
      const audit = JSON.parse(error.stdout || '{}');
      if (audit.vulnerabilities) {
        const count = Object.keys(audit.vulnerabilities).length;
        console.log(`⚠️  Found ${count} security vulnerability/vulnerabilities.\n`);
        console.log('Run `npm audit fix` to attempt automatic fixes.\n');
      }
    } catch {
      console.log('⚠️  Could not parse security audit. Run `npm audit` manually.\n');
    }
  }
}

function main() {
  console.log('📦 Package Version Check\n');
  console.log('=' .repeat(50) + '\n');

  const { outdated, critical } = checkOutdated();
  checkSecurity();

  if (critical.length > 0) {
    console.log('\n' + '='.repeat(50));
    console.log('⚠️  WARNING: Critical package updates available!');
    console.log('Review the updates above before proceeding.\n');
    process.exit(1);
  }

  if (outdated.length > 0) {
    console.log('\n' + '='.repeat(50));
    console.log('ℹ️  Some packages are outdated but not critical.');
    console.log('Run `npm update` to update patch/minor versions.\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkOutdated, checkSecurity };


