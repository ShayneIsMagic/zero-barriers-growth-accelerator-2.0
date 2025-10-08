#!/usr/bin/env node

const fetch = require('node-fetch');

async function testAIAnalysis() {
  console.log('🧪 Testing AI Analysis Capabilities\n');
  
  const testUrls = [
    'https://www.devpipeline.com/',
    'https://zerobarriers.io/',
    'https://www.salesforceconsultants.io/'
  ];

  for (const url of testUrls) {
    console.log(`\n🔍 Testing analysis for: ${url}`);
    console.log('─'.repeat(60));
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/analyze/website/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          provider: 'openai'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const duration = Date.now() - startTime;
      
      console.log(`✅ Analysis completed in ${duration}ms`);
      console.log(`📊 Overall Score: ${result.analysis.overallScore}/100`);
      console.log(`🎯 Golden Circle Score: ${result.analysis.goldenCircle.overallScore}/100`);
      console.log(`💎 Elements of Value Score: ${result.analysis.elementsOfValue.overallScore}/100`);
      console.log(`🌟 CliftonStrengths Score: ${result.analysis.cliftonStrengths.overallScore}/100`);
      console.log(`📝 Summary: ${result.analysis.summary.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`❌ Analysis failed: ${error.message}`);
      
      if (error.message.includes('not configured')) {
        console.log('💡 Run "npm run setup:ai-keys" to configure AI providers');
      }
    }
  }
  
  console.log('\n✨ Test completed!');
}

testAIAnalysis().catch(console.error);
