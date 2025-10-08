#!/usr/bin/env node

const fetch = require('node-fetch');

async function testPageAnalysis() {
  console.log('🧪 Testing Page Analysis System\n');

  const testUrls = [
    {
      url: 'https://zerobarriers.io/',
      pageType: 'home',
      description: 'Zero Barriers Home Page'
    },
    {
      url: 'https://zerobarriers.io/testimonials/',
      pageType: 'testimonials',
      description: 'Zero Barriers Testimonials Page'
    }
  ];

  for (const test of testUrls) {
    console.log(`🔍 Testing: ${test.description}`);
    console.log(`URL: ${test.url}`);
    console.log(`Page Type: ${test.pageType}`);
    console.log('─'.repeat(50));

    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/analyze/website/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: test.url,
          contentType: 'website'
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`❌ Analysis failed: ${errorData.details || errorData.error}`);
        console.log('');
        continue;
      }

      const data = await response.json();
      const analysis = data.analysis;

      console.log(`✅ Analysis completed in ${duration}ms`);
      console.log(`📊 Overall Score: ${analysis.overallScore}/100`);
      console.log(`🎯 Golden Circle Score: ${analysis.goldenCircle.overallScore}/100`);
      console.log(`💎 Elements of Value Score: ${analysis.elementsOfValue.overallScore}/100`);
      console.log(`🌟 CliftonStrengths Score: ${analysis.cliftonStrengths.overallScore}/100`);
      console.log('');
      console.log('🎯 GOLDEN CIRCLE ANALYSIS:');
      console.log(`Why: ${analysis.goldenCircle.why}`);
      console.log(`How: ${analysis.goldenCircle.how}`);
      console.log(`What: ${analysis.goldenCircle.what}`);
      console.log(`Who: ${analysis.goldenCircle.who}`);
      console.log('');
      console.log('📝 TOP RECOMMENDATIONS:');
      if (Array.isArray(analysis.recommendations)) {
        analysis.recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`${index + 1}. ${rec}`);
        });
      } else {
        console.log('No recommendations available');
      }
      console.log('');
      console.log('📄 SUMMARY:');
      console.log(analysis.summary.substring(0, 200) + '...');
      console.log('');

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('✨ Page analysis testing completed!');
}

// Run the test
testPageAnalysis().catch(console.error);
