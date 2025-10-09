#!/usr/bin/env node

/**
 * Test All Routes Script
 *
 * Tests that all main application routes are accessible
 * Run: node scripts/test-all-routes.js
 */

const routes = [
  // Main Pages
  { url: 'http://localhost:3000', name: 'Home' },
  { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
  { url: 'http://localhost:3000/dashboard/analysis', name: 'Analysis Hub' },

  // Analysis Tools
  { url: 'http://localhost:3000/dashboard/website-analysis', name: 'Website Analysis' },
  { url: 'http://localhost:3000/dashboard/comprehensive-analysis', name: 'Comprehensive Analysis' },
  { url: 'http://localhost:3000/dashboard/seo-analysis', name: 'SEO Analysis' },
  { url: 'http://localhost:3000/dashboard/enhanced-analysis', name: 'Enhanced Analysis' },
  { url: 'http://localhost:3000/dashboard/step-by-step-analysis', name: 'Step-by-Step Analysis' },
  { url: 'http://localhost:3000/dashboard/page-analysis', name: 'Page Analysis' },
  { url: 'http://localhost:3000/dashboard/evaluation-guide', name: 'Evaluation Guide' },
  { url: 'http://localhost:3000/dashboard/executive-reports', name: 'Executive Reports' },

  // Auth Pages
  { url: 'http://localhost:3000/auth/signin', name: 'Sign In' },
  { url: 'http://localhost:3000/auth/signup', name: 'Sign Up' },
  { url: 'http://localhost:3000/auth/forgot-password', name: 'Forgot Password' },

  // Test Pages
  { url: 'http://localhost:3000/test', name: 'Test Page' },
  { url: 'http://localhost:3000/test-login', name: 'Test Login' },

  // API Health
  { url: 'http://localhost:3000/api/health', name: 'API Health Check' },
];

async function testRoute(route) {
  try {
    const response = await fetch(route.url);
    const status = response.status;
    const statusText = response.statusText;

    if (status === 200) {
      console.log(`✅ ${route.name}: ${status} ${statusText}`);
      return { success: true, route: route.name, status };
    } else if (status === 404) {
      console.log(`❌ ${route.name}: ${status} Not Found`);
      return { success: false, route: route.name, status, error: 'Not Found' };
    } else if (status === 500) {
      console.log(`⚠️  ${route.name}: ${status} Server Error`);
      return { success: false, route: route.name, status, error: 'Server Error' };
    } else {
      console.log(`⚠️  ${route.name}: ${status} ${statusText}`);
      return { success: true, route: route.name, status, warning: statusText };
    }
  } catch (error) {
    console.log(`❌ ${route.name}: Connection Failed - ${error.message}`);
    return { success: false, route: route.name, error: error.message };
  }
}

async function testAllRoutes() {
  console.log('🚀 Testing All Routes...\n');
  console.log('Make sure the dev server is running: npm run dev:test\n');

  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  const results = [];

  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${routes.length}`);
  console.log(`❌ Failed: ${failed.length}/${routes.length}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed Routes:');
    failed.forEach(r => {
      console.log(`   - ${r.route}: ${r.error || r.status}`);
    });
  }

  console.log('\n✅ Test complete!');

  // Exit with appropriate code
  process.exit(failed.length > 0 ? 1 : 0);
}

// Check if server is running first
async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...\n');

  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:3000');
    console.error('\n💡 Start the server first:');
    console.error('   npm run dev:test\n');
    process.exit(1);
  }

  console.log('✅ Server is running!\n');
  await testAllRoutes();
}

// Run the tests
main();

