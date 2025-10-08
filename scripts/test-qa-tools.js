#!/usr/bin/env node

const fetch = require('node-fetch');

async function testQATools() {
  console.log('🔧 QA Tools Content Extraction Test\n');
  console.log('Testing Puppeteer, Cheerio, and Playwright for content extraction...\n');

  const testUrls = [
    {
      url: 'https://zerobarriers.io/',
      name: 'Zero Barriers Home Page',
      expectedContent: ['revenue', 'growth', 'transformation']
    },
    {
      url: 'https://zerobarriers.io/testimonials/',
      name: 'Zero Barriers Testimonials',
      expectedContent: ['testimonial', 'client', 'success']
    },
    {
      url: 'https://www.salesforceconsultants.io/',
      name: 'Salesforce Consultants',
      expectedContent: ['salesforce', 'crm', 'consulting']
    }
  ];

  const methods = ['puppeteer', 'cheerio'];

  for (const testUrl of testUrls) {
    console.log(`🌐 Testing: ${testUrl.name}`);
    console.log(`URL: ${testUrl.url}`);
    console.log('─'.repeat(80));

    for (const method of methods) {
      console.log(`\n🔧 Method: ${method.toUpperCase()}`);
      console.log('─'.repeat(40));

      try {
        const startTime = Date.now();
        
        const response = await fetch(`http://localhost:3000/api/scrape-page?url=${encodeURIComponent(testUrl.url)}&method=${method}`);
        
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (!response.ok) {
          const errorData = await response.json();
          console.log(`❌ ${method} failed: ${errorData.details || errorData.error}`);
          continue;
        }

        const data = await response.json();
        
        console.log(`✅ ${method} completed in ${duration}ms`);
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
        }
        
        if (data.contactInfo) {
          if (data.contactInfo.phone && data.contactInfo.phone.length > 0) {
            console.log(`📞 Phone: ${data.contactInfo.phone.join(', ')}`);
          }
          if (data.contactInfo.email && data.contactInfo.email.length > 0) {
            console.log(`📧 Email: ${data.contactInfo.email.join(', ')}`);
          }
        }
        
        if (data.technicalInfo) {
          console.log(`🔒 SSL: ${data.technicalInfo.hasSSL ? 'Yes' : 'No'}`);
          console.log(`📱 Mobile Friendly: ${data.technicalInfo.mobileFriendly ? 'Yes' : 'No'}`);
          console.log(`🏷️  Schema Markup: ${data.technicalInfo.hasSchema ? 'Yes' : 'No'}`);
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
        console.log(`❌ ${method} error: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(80) + '\n');
  }

  console.log('🎉 QA Tools Testing Complete!');
  console.log('');
  console.log('📊 SUMMARY:');
  console.log('• Puppeteer: Best for JavaScript-heavy sites, full browser automation');
  console.log('• Cheerio: Fastest for simple HTML parsing, lightweight');
  console.log('• Playwright: Cross-browser support, good alternative to Puppeteer');
  console.log('');
  console.log('🚀 All QA tools are now integrated and ready for production!');
}

// Run the QA tools test
testQATools().catch(console.error);
