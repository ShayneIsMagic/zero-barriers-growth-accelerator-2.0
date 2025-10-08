#!/usr/bin/env node

const fetch = require('node-fetch');

// Real content from zerobarriers.io for testing
const ZEROBARRIERS_HOME_CONTENT = `
Zero Barriers Growth Accelerator

Purpose-Driven Growth Agency

Transform Your Revenue Growth
Rapid, Substantial, Sustainable Growth

We specialize in rapid revenue transformation through proven methodologies that deliver measurable results. Our expert team unlocks your business potential with data-driven strategies and systematic implementation.

150% Average Revenue Growth
90 Days to Results
200+ Businesses Transformed

Our Proven Four-Phase Methodology

1. Identify Revenue Barriers
Uncover what's preventing rapid revenue growth through comprehensive analysis of your current operations, identifying revenue bottlenecks, misalignments, and untapped revenue potential.

2. Implement Revenue Growth Best Practices
Implement proven revenue generation systems by mapping top performer strategies, creating custom revenue growth playbooks, and establishing metrics that drive substantial growth.

3. Adapt Revenue Systems to Strengths
Customize revenue generation solutions to your unique context by tailoring systems to leverage individual and team strengths, aligning revenue processes with your company culture for sustainable growth.

4. Engineer Revenue Success
Create predictable, repeatable revenue growth patterns through systematic replication of top-performing revenue strategies and continuous improvement cycles driven by real-time data for sustainable growth.

Our Core Solutions

Human Transformation
Powered by our purpose-driven revenue growth methodologies, we help individuals and teams unlock their full revenue potential through our proprietary frameworks:
- The Attitude Cycle™
- IMPROV Sales Methodology™
- Purpose-Driven Exercise™

Technology Enablement
Through our strategic partnerships, we implement the right technology solutions to streamline revenue operations and enhance customer experiences for rapid growth:
- Custom software development
- Salesforce implementation
- System integration and automation

Revenue Acceleration
Combining people, process, and technology for breakthrough revenue results, we create systems that generate predictable, sustainable revenue growth and substantial business expansion:
- Sales process optimization
- KPI-driven performance management
- Continuous improvement cycles

Client Success Stories

122% Growth Achievement
"We achieved 122% growth in our first year! The coaching has given me greater confidence as a business owner. Zero Barriers has empowered our team and instilled ownership principles."
— Jason Kidman, Owner | SOS Support

25% Consistent Growth
"Shayne has tools and ideas that produce remarkable results. We grew 25% in revenue consistently for nearly a year. He genuinely cares for those he serves and his systems work."
— Greg Williams, Business Owner | SeboDev

Sales Process Optimization
"Working with Shayne was a game-changer! He quickly identified our sales challenges and provided effective solutions. His enthusiasm boosted results and morale across the entire team."
— Kyle C., Sales Manager | Q90

Purpose-Driven Transformation
"The purpose-driven model transformed my life, removing obstacles and igniting my potential. Being purpose-oriented has given me direction, freedom, fulfillment, confidence, peace, success, happiness, and love."
— Michelle A., Purpose-Driven Leader | SOS Support

Contact Us
518 E 800 N, Suite A
Orem, Utah 84097
+1 (801) 997-0457
info@zerobarriers.io
`;

async function testRealAnalysis() {
  console.log('🧪 Testing Real Analysis with Zero Barriers Content\n');

  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/analyze/website/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: ZEROBARRIERS_HOME_CONTENT,
        contentType: 'website',
        url: 'https://zerobarriers.io/'
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Analysis failed: ${errorData.details || errorData.error}`);
      return;
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
      analysis.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    } else {
      console.log('No recommendations available');
    }
    console.log('');

    console.log('📄 SUMMARY:');
    console.log(analysis.summary);
    console.log('');

    console.log('🔍 GOLDEN CIRCLE INSIGHTS:');
    analysis.goldenCircle.insights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight}`);
    });
    console.log('');

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run the test
testRealAnalysis().catch(console.error);
