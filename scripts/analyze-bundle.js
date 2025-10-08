#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size and performance...\n');

try {
  // Set environment variable for bundle analysis
  process.env.ANALYZE = 'true';
  
  // Build the project with bundle analysis
  console.log('📦 Building project with bundle analysis...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Bundle analysis complete!');
  console.log('📊 Check ./bundle-analyzer.html for detailed bundle analysis');
  
  // Check if bundle analyzer file exists
  const analyzerPath = path.join(process.cwd(), 'bundle-analyzer.html');
  if (fs.existsSync(analyzerPath)) {
    console.log('🌐 Open bundle-analyzer.html in your browser to see detailed bundle breakdown');
  }
  
  // Get build output size
  const outDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(outDir)) {
    console.log('\n📈 Build output analysis:');
    
    // Check static files size
    const staticDir = path.join(outDir, 'static');
    if (fs.existsSync(staticDir)) {
      const { execSync } = require('child_process');
      try {
        const sizeOutput = execSync(`du -sh ${staticDir}`, { encoding: 'utf8' });
        console.log(`📁 Static files size: ${sizeOutput.trim().split('\t')[0]}`);
      } catch (error) {
        console.log('📁 Static files: Present (size check skipped)');
      }
    }
  }
  
  console.log('\n🎯 Performance optimization recommendations:');
  console.log('1. Check bundle-analyzer.html for large dependencies');
  console.log('2. Consider code splitting for large components');
  console.log('3. Optimize images and use Next.js Image component');
  console.log('4. Enable compression in production');
  console.log('5. Use dynamic imports for heavy libraries');
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
