#!/usr/bin/env node

const fetch = require('node-fetch');

async function testComprehensiveAnalysis() {
  console.log('🎯 Comprehensive Analysis Test\n');
  console.log('Testing WHY, HOW, WHAT, WHO + Bain Elements of Value + CliftonStrengths...\n');

  const testUrl = 'https://zerobarriers.io/';
  
  console.log(`🌐 Analyzing: ${testUrl}`);
  console.log('─'.repeat(80));

  try {
    // First, extract content
    console.log('🔍 Step 1: Extracting content...');
    const scrapeResponse = await fetch(`http://localhost:3000/api/scrape-page?url=${encodeURIComponent(testUrl)}`);
    
    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json();
      console.log(`❌ Content extraction failed: ${errorData.details || errorData.error}`);
      return;
    }

    const scrapeData = await scrapeResponse.json();
    console.log(`✅ Content extracted: ${scrapeData.wordCount} words, ${scrapeData.imageCount} images`);

    // Now analyze the content
    console.log('\n🧠 Step 2: Running comprehensive analysis...');
    const analysisResponse = await fetch('http://localhost:3000/api/analyze/website/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl,
        content: scrapeData.content
      })
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      console.log(`❌ Analysis failed: ${errorData.details || errorData.error}`);
      return;
    }

    const analysis = await analysisResponse.json();
    
    console.log('✅ Analysis completed successfully!\n');

    // Display Golden Circle Analysis
    console.log('🎯 GOLDEN CIRCLE ANALYSIS (Simon Sinek)');
    console.log('═'.repeat(50));
    
    if (analysis.goldenCircle) {
      console.log(`\n💡 WHY (Score: ${analysis.goldenCircle.why?.score || 'N/A'}/10):`);
      console.log(`"${analysis.goldenCircle.why?.statement || 'Not found'}"`);
      console.log(`Source: ${analysis.goldenCircle.why?.source || 'Unknown'}`);
      
      console.log(`\n🔧 HOW (Score: ${analysis.goldenCircle.how?.score || 'N/A'}/10):`);
      console.log(`"${analysis.goldenCircle.how?.methodology || 'Not found'}"`);
      if (analysis.goldenCircle.how?.framework) {
        console.log(`Framework: ${analysis.goldenCircle.how.framework}`);
      }
      
      console.log(`\n📦 WHAT (Score: ${analysis.goldenCircle.what?.score || 'N/A'}/10):`);
      if (analysis.goldenCircle.what?.offerings) {
        analysis.goldenCircle.what.offerings.forEach((offering, index) => {
          console.log(`${index + 1}. ${offering}`);
        });
      }
      
      console.log(`\n👥 WHO (Score: ${analysis.goldenCircle.who?.score || 'N/A'}/10):`);
      if (analysis.goldenCircle.who?.testimonials) {
        analysis.goldenCircle.who.testimonials.forEach((testimonial, index) => {
          console.log(`${index + 1}. ${testimonial.client} (${testimonial.company})`);
          console.log(`   "${testimonial.quote}"`);
          if (testimonial.results) {
            console.log(`   Results: ${testimonial.results}`);
          }
        });
      }
      
      console.log(`\n📊 Overall Golden Circle Score: ${analysis.goldenCircle.overallScore || 'N/A'}/10`);
    }

    // Display Elements of Value Analysis
    console.log('\n\n💎 ELEMENTS OF VALUE ANALYSIS (Bain & Company)');
    console.log('═'.repeat(50));
    
    if (analysis.elementsOfValue) {
      console.log('\n🔧 FUNCTIONAL ELEMENTS:');
      const functional = analysis.elementsOfValue.functional || {};
      Object.entries(functional).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log('\n❤️ EMOTIONAL ELEMENTS:');
      const emotional = analysis.elementsOfValue.emotional || {};
      Object.entries(emotional).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log('\n🚀 LIFE-CHANGING ELEMENTS:');
      const lifeChanging = analysis.elementsOfValue.lifeChanging || {};
      Object.entries(lifeChanging).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log('\n🌍 SOCIAL IMPACT ELEMENTS:');
      const socialImpact = analysis.elementsOfValue.socialImpact || {};
      Object.entries(socialImpact).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log(`\n📊 Overall Elements of Value Score: ${analysis.elementsOfValue.overallScore || 'N/A'}/10`);
      
      if (analysis.elementsOfValue.topElements) {
        console.log(`\n🏆 Top Elements: ${analysis.elementsOfValue.topElements.join(', ')}`);
      }
    }

    // Display CliftonStrengths Analysis
    console.log('\n\n🎭 CLIFTONSTRENGTHS ANALYSIS (Gallup)');
    console.log('═'.repeat(50));
    
    if (analysis.cliftonStrengths) {
      console.log('\n⚡ EXECUTING THEMES:');
      const executing = analysis.cliftonStrengths.executing || {};
      Object.entries(executing).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log('\n🎯 INFLUENCING THEMES:');
      const influencing = analysis.cliftonStrengths.influencing || {};
      Object.entries(influencing).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log('\n🤝 RELATIONSHIP BUILDING THEMES:');
      const relationshipBuilding = analysis.cliftonStrengths.relationshipBuilding || {};
      Object.entries(relationshipBuilding).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log('\n🧠 STRATEGIC THINKING THEMES:');
      const strategicThinking = analysis.cliftonStrengths.strategicThinking || {};
      Object.entries(strategicThinking).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.score) {
          console.log(`${key}: ${value.score}/10 - "${value.evidence || 'No evidence'}"`);
        }
      });
      
      console.log(`\n📊 Overall CliftonStrengths Score: ${analysis.cliftonStrengths.overallScore || 'N/A'}/10`);
      
      if (analysis.cliftonStrengths.topThemes) {
        console.log(`\n🏆 Top Themes: ${analysis.cliftonStrengths.topThemes.join(', ')}`);
      }
    }

    // Display Recommendations
    console.log('\n\n💡 ACTIONABLE RECOMMENDATIONS');
    console.log('═'.repeat(50));
    
    if (analysis.recommendations) {
      if (analysis.recommendations.highPriority && analysis.recommendations.highPriority.length > 0) {
        console.log('\n🔴 HIGH PRIORITY:');
        analysis.recommendations.highPriority.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec.title} (${rec.category})`);
          console.log(`   ${rec.description}`);
          console.log(`   Impact: ${rec.expectedImpact}`);
          console.log(`   Effort: ${rec.effort} | Timeline: ${rec.timeline}`);
          if (rec.actionItems) {
            rec.actionItems.forEach(item => {
              console.log(`   • ${item}`);
            });
          }
          console.log('');
        });
      }
      
      if (analysis.recommendations.mediumPriority && analysis.recommendations.mediumPriority.length > 0) {
        console.log('\n🟡 MEDIUM PRIORITY:');
        analysis.recommendations.mediumPriority.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec.title} (${rec.category})`);
          console.log(`   ${rec.description}`);
          console.log(`   Impact: ${rec.expectedImpact}`);
          console.log(`   Effort: ${rec.effort} | Timeline: ${rec.timeline}`);
          if (rec.actionItems) {
            rec.actionItems.forEach(item => {
              console.log(`   • ${item}`);
            });
          }
          console.log('');
        });
      }
      
      if (analysis.recommendations.nextSteps) {
        console.log('\n🚀 NEXT STEPS:');
        analysis.recommendations.nextSteps.forEach((step, index) => {
          console.log(`${index + 1}. ${step}`);
        });
      }
    }

    // Overall Summary
    console.log('\n\n📊 OVERALL ANALYSIS SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Overall Score: ${analysis.overallScore || 'N/A'}/10`);
    console.log(`Analysis Method: ${analysis.method || 'Unknown'}`);
    console.log(`Content Analyzed: ${scrapeData.wordCount} words`);
    console.log(`Analysis Date: ${new Date().toISOString()}`);
    
    if (analysis.summary) {
      console.log(`\nSummary: ${analysis.summary}`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Comprehensive Analysis Complete!');
}

// Run the comprehensive analysis test
testComprehensiveAnalysis().catch(console.error);