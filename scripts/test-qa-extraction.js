#!/usr/bin/env node

const fetch = require('node-fetch');

async function testQAExtraction() {
  console.log('🎭 QA Tools Content Extraction Test\n');
  console.log('Testing Playwright (primary) -> Puppeteer (fallback) -> Fetch (final fallback)...\n');

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

  for (const testUrl of testUrls) {
    console.log(`🌐 Testing: ${testUrl.name}`);
    console.log(`URL: ${testUrl.url}`);
    console.log('─'.repeat(80));

    try {
      const startTime = Date.now();
      
      const response = await fetch(`http://localhost:3000/api/scrape-page?url=${encodeURIComponent(testUrl.url)}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`❌ Extraction failed: ${errorData.details || errorData.error}`);
        continue;
      }

      const data = await response.json();
      
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
      console.log(`\n📄 Content Preview (first 300 chars):`);
      console.log(`"${data.content.substring(0, 300)}..."`);

      // Method-specific insights
      if (data.method === 'playwright') {
        console.log(`\n🎭 Playwright Success: Full browser automation with JavaScript execution`);
      } else if (data.method === 'puppeteer') {
        console.log(`\n🎪 Puppeteer Fallback: Chrome automation (Playwright failed)`);
      } else if (data.method === 'fallback') {
        console.log(`\n🔄 Fetch Fallback: Simple HTTP request (both browsers failed)`);
      }

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(80) + '\n');
  }

  console.log('🎉 QA Tools Testing Complete!');
  console.log('');
  console.log('📊 EXTRACTION STRATEGY:');
  console.log('1. 🎭 Playwright (Primary): Best performance, cross-browser support');
  console.log('2. 🎪 Puppeteer (Fallback): Chrome automation if Playwright fails');
  console.log('3. 🔄 Fetch (Final): Simple HTTP if both browsers fail');
  console.log('');
  console.log('🚀 All QA tools are now integrated with intelligent fallback!');
}

// Run the QA extraction test
testQAExtraction().catch(console.error);
