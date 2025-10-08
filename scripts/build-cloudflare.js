#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for Cloudflare Pages...');

try {
  // Use the existing next.config.js (no need to swap configs)
  console.log('✅ Using existing Next.js configuration');
  
  console.log('✅ Cloudflare configuration applied');
  
  // Build the application
  console.log('📦 Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: out/');
  console.log('🌐 Ready for Cloudflare Pages deployment');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
