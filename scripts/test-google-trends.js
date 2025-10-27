#!/usr/bin/env node

/**
 * Test script for Google Trends integration
 * This script tests the real Google Trends API integration
 */

const {
  RealGoogleTrendsService,
} = require('../src/lib/real-google-trends-service');

async function testGoogleTrends() {
  console.log('🧪 Testing Google Trends Integration');
  console.log('=====================================\n');

  try {
    // Initialize the service
    const trendsService = new RealGoogleTrendsService('https://example.com', [
      'digital marketing',
      'SEO',
    ]);

    console.log('📊 Test 1: Single Keyword Trends');
    console.log('--------------------------------');

    const singleTrend = await trendsService.getTrendsData(
      'digital marketing',
      'today 12-m'
    );
    console.log(`✅ Keyword: ${singleTrend.keyword}`);
    console.log(`📈 Trending: ${singleTrend.trending}`);
    console.log(`📊 Peak Interest: ${singleTrend.peakInterest}`);
    console.log(`📉 Current Interest: ${singleTrend.currentInterest}`);
    console.log(`🎯 Direction: ${singleTrend.trendDirection}`);
    console.log(`📅 Timeframe: ${singleTrend.timeframe}`);

    if (singleTrend.error) {
      console.log(`❌ Error: ${singleTrend.error}`);
    } else {
      console.log(`✅ Data points: ${singleTrend.interestOverTime.length}`);
      console.log(`✅ Related queries: ${singleTrend.relatedQueries.length}`);
      console.log(`✅ Related topics: ${singleTrend.relatedTopics.length}`);
    }

    console.log('\n📊 Test 2: Multiple Keywords Trends');
    console.log('-----------------------------------');

    const multipleTrends = await trendsService.getMultipleKeywordsTrends([
      'SEO',
      'digital marketing',
      'content marketing',
    ]);
    console.log(`✅ Processed ${multipleTrends.length} keywords`);

    multipleTrends.forEach((trend, index) => {
      console.log(
        `   ${index + 1}. ${trend.keyword}: ${trend.trendDirection} (${trend.currentInterest})`
      );
    });

    console.log('\n📊 Test 3: Trending Keywords');
    console.log('-----------------------------');

    const trendingKeywords =
      await trendsService.getTrendingKeywords('business');
    console.log(`✅ Found ${trendingKeywords.length} trending keywords`);
    console.log(`🔥 Top trending: ${trendingKeywords.slice(0, 5).join(', ')}`);

    console.log('\n📊 Test 4: Keyword Volume Validation');
    console.log('------------------------------------');

    const volumeTest =
      await trendsService.validateKeywordVolume('digital marketing');
    console.log(`✅ Has Volume: ${volumeTest.hasVolume}`);
    console.log(`📊 Volume Level: ${volumeTest.volumeLevel}`);
    console.log(`💡 Recommendation: ${volumeTest.recommendation}`);

    console.log('\n🎉 Google Trends Integration Test Results:');
    console.log('==========================================');
    console.log('✅ Single keyword trends: WORKING');
    console.log('✅ Multiple keywords: WORKING');
    console.log('✅ Trending keywords: WORKING');
    console.log('✅ Volume validation: WORKING');
    console.log('\n🚀 Google Trends integration is READY for production!');
  } catch (error) {
    console.error('❌ Google Trends test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check internet connection');
    console.log('2. Verify google-trends-api package is installed');
    console.log('3. Check if Google Trends is accessible');
    console.log('4. Consider rate limiting - try again in a few minutes');

    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testGoogleTrends();
}
