#!/usr/bin/env node

const fetch = require('node-fetch');

async function compareQATools() {
  console.log('⚖️  QA Tools Comparison Test\n');
  console.log('Comparing Puppeteer vs Cheerio for content extraction...\n');

  const testUrl = 'https://zerobarriers.io/';
  const methods = ['puppeteer', 'cheerio'];
  const results = {};

  console.log(`🌐 Testing URL: ${testUrl}\n`);

  // Test each method
  for (const method of methods) {
    console.log(`🔧 Testing ${method.toUpperCase()}...`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`http://localhost:3000/api/scrape-page?url=${encodeURIComponent(testUrl)}&method=${method}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`❌ ${method} failed: ${errorData.details || errorData.error}`);
        continue;
      }

      const data = await response.json();
      results[method] = {
        ...data,
        duration,
        success: true
      };

      console.log(`✅ ${method} completed in ${duration}ms`);

    } catch (error) {
      console.log(`❌ ${method} error: ${error.message}`);
      results[method] = {
        success: false,
        error: error.message
      };
    }
  }

  // Compare results
  console.log('\n📊 COMPARISON RESULTS');
  console.log('═'.repeat(80));

  const successfulMethods = Object.keys(results).filter(method => results[method].success);
  
  if (successfulMethods.length === 0) {
    console.log('❌ No methods succeeded');
    return;
  }

  // Performance comparison
  console.log('\n⚡ PERFORMANCE COMPARISON:');
  console.log('─'.repeat(40));
  successfulMethods.forEach(method => {
    const result = results[method];
    console.log(`${method.toUpperCase()}: ${result.duration}ms`);
  });

  // Content quality comparison
  console.log('\n📄 CONTENT QUALITY COMPARISON:');
  console.log('─'.repeat(40));
  
  const metrics = ['wordCount', 'imageCount', 'linkCount', 'headingCount', 'paragraphCount'];
  
  metrics.forEach(metric => {
    console.log(`\n${metric}:`);
    successfulMethods.forEach(method => {
      const value = results[method][metric];
      console.log(`  ${method}: ${value}`);
    });
  });

  // Content extraction quality
  console.log('\n🎯 CONTENT EXTRACTION QUALITY:');
  console.log('─'.repeat(40));
  
  successfulMethods.forEach(method => {
    const result = results[method];
    console.log(`\n${method.toUpperCase()}:`);
    console.log(`  Title Length: ${result.title.length} chars`);
    console.log(`  Description Length: ${result.metaDescription.length} chars`);
    console.log(`  Content Length: ${result.content.length} chars`);
    console.log(`  Contact Info: ${result.contactInfo ? 'Yes' : 'No'}`);
    console.log(`  Social Links: ${result.socialMediaLinks ? result.socialMediaLinks.length : 0}`);
    console.log(`  Technical Info: ${result.technicalInfo ? 'Yes' : 'No'}`);
  });

  // Content preview comparison
  console.log('\n📄 CONTENT PREVIEW COMPARISON:');
  console.log('─'.repeat(40));
  
  successfulMethods.forEach(method => {
    const result = results[method];
    console.log(`\n${method.toUpperCase()} Preview:`);
    console.log(`"${result.content.substring(0, 150)}..."`);
  });

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('─'.repeat(40));
  
  if (results.puppeteer && results.puppeteer.success && results.cheerio && results.cheerio.success) {
    const puppeteerWords = results.puppeteer.wordCount;
    const cheerioWords = results.cheerio.wordCount;
    const puppeteerTime = results.puppeteer.duration;
    const cheerioTime = results.cheerio.duration;
    
    console.log(`• Content Quality: ${puppeteerWords > cheerioWords ? 'Puppeteer' : 'Cheerio'} extracted more content`);
    console.log(`• Speed: ${cheerioTime < puppeteerTime ? 'Cheerio' : 'Puppeteer'} is faster`);
    console.log(`• Use Puppeteer for: JavaScript-heavy sites, dynamic content, screenshots`);
    console.log(`• Use Cheerio for: Simple HTML sites, speed-critical applications, serverless`);
  }

  console.log('\n🎉 Comparison Complete!');
}

// Run the comparison
compareQATools().catch(console.error);
