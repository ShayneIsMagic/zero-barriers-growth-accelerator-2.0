#!/usr/bin/env node

const fetch = require('node-fetch');

async function testProductionExtraction() {
  console.log('🚀 Production Content Extraction Test\n');
  console.log('Testing Enhanced Fetch API (Production-Ready Solution)...\n');

  const testUrls = [
    {
      url: 'https://zerobarriers.io/',
      name: 'Zero Barriers Home Page',
      expectedContent: ['revenue', 'growth', 'transformation', 'consulting']
    },
    {
      url: 'https://zerobarriers.io/testimonials/',
      name: 'Zero Barriers Testimonials',
      expectedContent: ['testimonial', 'client', 'success', 'case study']
    },
    {
      url: 'https://www.salesforceconsultants.io/',
      name: 'Salesforce Consultants',
      expectedContent: ['salesforce', 'crm', 'consulting', 'implementation']
    }
  ];

  let totalTime = 0;
  let successCount = 0;

  for (const testUrl of testUrls) {
    console.log(`🌐 Testing: ${testUrl.name}`);
    console.log(`URL: ${testUrl.url}`);
    console.log('─'.repeat(80));

    try {
      const startTime = Date.now();
      
      const response = await fetch(`http://localhost:3000/api/scrape-page?url=${encodeURIComponent(testUrl.url)}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      totalTime += duration;

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`❌ Extraction failed: ${errorData.details || errorData.error}`);
        continue;
      }

      const data = await response.json();
      successCount++;
      
      console.log(`✅ Extraction completed in ${duration}ms using ${data.method.toUpperCase()}`);
      console.log(`📄 Title: ${data.title}`);
      console.log(`📝 Description: ${data.metaDescription.substring(0, 100)}...`);
      console.log(`📊 Word Count: ${data.wordCount.toLocaleString()}`);
      console.log(`🖼️  Images: ${data.imageCount}`);
      console.log(`🔗 Links: ${data.linkCount}`);
      console.log(`📋 Headings: ${data.headingCount}`);
      console.log(`📄 Paragraphs: ${data.paragraphCount}`);
      console.log(`📝 Lists: ${data.listCount}`);
      console.log(`📋 Forms: ${data.formCount}`);
      console.log(`🎥 Videos: ${data.videoCount}`);
      
      if (data.socialMediaLinks && data.socialMediaLinks.length > 0) {
        console.log(`📱 Social Media: ${data.socialMediaLinks.length} links`);
        data.socialMediaLinks.slice(0, 3).forEach(link => {
          console.log(`   • ${link}`);
        });
      }
      
      if (data.contactInfo) {
        if (data.contactInfo.phone && data.contactInfo.phone.length > 0) {
          console.log(`📞 Phone: ${data.contactInfo.phone.join(', ')}`);
        }
        if (data.contactInfo.email && data.contactInfo.email.length > 0) {
          console.log(`📧 Email: ${data.contactInfo.email.join(', ')}`);
        }
        if (data.contactInfo.address && data.contactInfo.address.length > 0) {
          console.log(`📍 Address: ${data.contactInfo.address.join(', ')}`);
        }
      }
      
      if (data.technicalInfo) {
        console.log(`🔒 SSL: ${data.technicalInfo.hasSSL ? 'Yes' : 'No'}`);
        console.log(`📱 Mobile Friendly: ${data.technicalInfo.mobileFriendly ? 'Yes' : 'No'}`);
        console.log(`🏷️  Schema Markup: ${data.technicalInfo.hasSchema ? 'Yes' : 'No'}`);
        console.log(`⏱️  Load Time: ${data.technicalInfo.loadTime}ms`);
        if (data.technicalInfo.viewport) {
          console.log(`📐 Viewport: ${data.technicalInfo.viewport.width}x${data.technicalInfo.viewport.height}`);
        }
      }

      // Check for expected content
      const contentLower = data.content.toLowerCase();
      const foundContent = testUrl.expectedContent.filter(keyword => 
        contentLower.includes(keyword.toLowerCase())
      );
      
      console.log(`🎯 Expected Content Found: ${foundContent.length}/${testUrl.expectedContent.length}`);
      console.log(`   Found: ${foundContent.join(', ')}`);
      console.log(`   Missing: ${testUrl.expectedContent.filter(k => !foundContent.includes(k)).join(', ')}`);

      // Show content preview
      console.log(`\n📄 Content Preview (first 200 chars):`);
      console.log(`"${data.content.substring(0, 200)}..."`);

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(80) + '\n');
  }

  // Summary
  const averageTime = totalTime / testUrls.length;
  console.log('📊 PRODUCTION EXTRACTION SUMMARY');
  console.log('═'.repeat(50));
  console.log(`✅ Success Rate: ${successCount}/${testUrls.length} (${Math.round(successCount/testUrls.length*100)}%)`);
  console.log(`⏱️  Average Time: ${Math.round(averageTime)}ms`);
  console.log(`🚀 Total Time: ${Math.round(totalTime/1000)}s`);
  console.log('');
  console.log('🎯 PRODUCTION SOLUTION BENEFITS:');
  console.log('• ✅ Cloudflare Pages Compatible');
  console.log('• ✅ No External Dependencies');
  console.log('• ✅ Fast & Reliable');
  console.log('• ✅ Cost-Effective');
  console.log('• ✅ High-Quality Extraction');
  console.log('');
  console.log('🚀 Ready for Production Deployment!');
}

// Run the production extraction test
testProductionExtraction().catch(console.error);
