#!/usr/bin/env node

const fetch = require('node-fetch');

async function testRealContent() {
  console.log('🧪 Real Content Analysis Test\n');
  console.log('Testing with actual website content...\n');

  try {
    // Step 1: Extract content from a real website
    console.log('🔍 Step 1: Extracting content from zerobarriers.io...');
    const scrapeResponse = await fetch(`http://localhost:3000/api/scrape-page?url=https://zerobarriers.io/`);
    
    if (!scrapeResponse.ok) {
      console.log('❌ Content extraction failed');
      return;
    }

    const scrapeData = await scrapeResponse.json();
    console.log(`✅ Content extracted: ${scrapeData.wordCount} words, ${scrapeData.imageCount} images`);

    // Step 2: Analyze the content
    console.log('\n🧠 Step 2: Analyzing content...');
    const analysisResponse = await fetch('http://localhost:3000/api/analyze/website/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://zerobarriers.io/',
        content: scrapeData.content
      })
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      console.log(`❌ Analysis failed: ${errorData.details || errorData.error}`);
      return;
    }

    const analysis = await analysisResponse.json();
    
    console.log('✅ Analysis completed!\n');

    // Display results in a readable format
    console.log('📊 ANALYSIS RESULTS');
    console.log('═'.repeat(60));
    
    if (analysis.analysis && analysis.analysis.goldenCircle) {
      const gc = analysis.analysis.goldenCircle;
      
      console.log('\n💡 GOLDEN CIRCLE ANALYSIS (Simon Sinek)');
      console.log('─'.repeat(40));
      console.log(`WHY: "${gc.why}"`);
      console.log(`HOW: "${gc.how}"`);
      console.log(`WHAT: "${gc.what}"`);
      console.log(`WHO: "${gc.who}"`);
      console.log(`Overall Score: ${gc.overallScore}/100`);
      
      if (gc.insights && gc.insights.length > 0) {
        console.log('\nInsights:');
        gc.insights.forEach((insight, index) => {
          console.log(`${index + 1}. ${insight}`);
        });
      }
    }

    if (analysis.analysis && analysis.analysis.elementsOfValue) {
      const eov = analysis.analysis.elementsOfValue;
      
      console.log('\n💎 ELEMENTS OF VALUE ANALYSIS (Bain & Company)');
      console.log('─'.repeat(40));
      console.log(`Overall Score: ${eov.overallScore}/100`);
      
      // Show functional elements with scores
      console.log('\nFunctional Elements:');
      Object.entries(eov.functional).forEach(([key, value]) => {
        if (value > 0) {
          console.log(`  ${key}: ${value}/10`);
        }
      });
      
      // Show emotional elements with scores
      console.log('\nEmotional Elements:');
      Object.entries(eov.emotional).forEach(([key, value]) => {
        if (value > 0) {
          console.log(`  ${key}: ${value}/10`);
        }
      });
    }

    if (analysis.analysis && analysis.analysis.cliftonStrengths) {
      const cs = analysis.analysis.cliftonStrengths;
      
      console.log('\n🎭 CLIFTONSTRENGTHS ANALYSIS (Gallup)');
      console.log('─'.repeat(40));
      console.log(`Overall Score: ${cs.overallScore}/100`);
      
      // Show strengths with scores
      Object.entries(cs).forEach(([key, value]) => {
        if (typeof value === 'number' && value > 0) {
          console.log(`  ${key}: ${value}/10`);
        }
      });
    }

    if (analysis.analysis && analysis.analysis.recommendations) {
      console.log('\n💡 RECOMMENDATIONS');
      console.log('─'.repeat(40));
      analysis.analysis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log(`\n📊 Overall Analysis Score: ${analysis.analysis?.overallScore || 'N/A'}/100`);
    console.log(`Provider: ${analysis.provider || 'Unknown'}`);
    console.log(`Timestamp: ${analysis.timestamp || 'Unknown'}`);

    if (analysis.analysis && analysis.analysis.summary) {
      console.log(`\n📝 Summary: ${analysis.analysis.summary}`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Real Content Analysis Test Complete!');
}

// Run the real content test
testRealContent().catch(console.error);
