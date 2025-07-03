#!/usr/bin/env node

/**
 * Puppeteer Test Runner for Category Creation
 * This script runs the category creation tests without Jest
 */

const puppeteer = require('puppeteer');

async function runCategoryCreationTests() {
  console.log('🚀 Starting Category Creation Puppeteer Tests');
  console.log('================================================');
  
  let browser;
  let testResults = [];
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu'
      ],
      defaultViewport: {
        width: 1280,
        height: 720
      }
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log('PAGE:', msg.text());
    });
    
    // Test 1: Check if servers are running
    console.log('\n📡 Test 1: Server Connectivity');
    console.log('--------------------------------');
    
    try {
      console.log('🔍 Checking backend server...');
      const backendResponse = await page.goto('http://localhost:8000/health', {
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      
      if (backendResponse && backendResponse.ok()) {
        console.log('✅ Backend server is running');
        testResults.push({ test: 'Backend Server', status: 'PASS' });
      } else {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      console.log('❌ Backend server is not running');
      console.log('💡 Please start: poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000');
      testResults.push({ test: 'Backend Server', status: 'FAIL', error: error.message });
    }
    
    try {
      console.log('🔍 Checking frontend server...');
      const frontendResponse = await page.goto('http://localhost:3000', {
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      
      if (frontendResponse && frontendResponse.ok()) {
        console.log('✅ Frontend server is running');
        testResults.push({ test: 'Frontend Server', status: 'PASS' });
      } else {
        throw new Error('Frontend not responding');
      }
    } catch (error) {
      console.log('❌ Frontend server is not running');
      console.log('💡 Please start: npm run dev');
      testResults.push({ test: 'Frontend Server', status: 'FAIL', error: error.message });
    }
    
    // Test 2: Category Creation Page Load
    console.log('\n📝 Test 2: Category Creation Page');
    console.log('----------------------------------');
    
    try {
      console.log('🔍 Loading category creation page...');
      await page.goto('http://localhost:3000/products/categories/new', {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
      
      // Check for page title
      const title = await page.$eval('h1', el => el.textContent).catch(() => 'No title found');
      console.log('📄 Page title:', title);
      
      if (title.includes('Create New Category')) {
        console.log('✅ Category creation page loaded successfully');
        testResults.push({ test: 'Page Load', status: 'PASS' });
      } else {
        throw new Error('Page title not as expected');
      }
      
    } catch (error) {
      console.log('❌ Failed to load category creation page');
      testResults.push({ test: 'Page Load', status: 'FAIL', error: error.message });
    }
    
    // Test 3: Form Elements
    console.log('\n🎯 Test 3: Form Elements');
    console.log('-------------------------');
    
    try {
      console.log('🔍 Checking form elements...');
      
      const nameInput = await page.$('#category-name');
      const submitButton = await page.$('button[type="submit"]');
      const form = await page.$('form');
      
      console.log('📝 Category name input:', nameInput ? '✅ Found' : '❌ Missing');
      console.log('🔘 Submit button:', submitButton ? '✅ Found' : '❌ Missing');
      console.log('📋 Form element:', form ? '✅ Found' : '❌ Missing');
      
      if (nameInput && submitButton && form) {
        console.log('✅ All required form elements found');
        testResults.push({ test: 'Form Elements', status: 'PASS' });
      } else {
        throw new Error('Missing form elements');
      }
      
    } catch (error) {
      console.log('❌ Form elements check failed');
      testResults.push({ test: 'Form Elements', status: 'FAIL', error: error.message });
    }
    
    // Test 4: Form Interaction (if possible)
    console.log('\n⚡ Test 4: Form Interaction');
    console.log('---------------------------');
    
    try {
      const nameInput = await page.$('#category-name');
      if (nameInput) {
        const timestamp = Date.now();
        const testCategoryName = `Puppeteer Test ${timestamp}`;
        
        console.log('📝 Filling category name:', testCategoryName);
        await page.type('#category-name', testCategoryName);
        
        // Get the value to confirm it was entered
        const inputValue = await page.$eval('#category-name', el => el.value);
        console.log('✅ Input value confirmed:', inputValue);
        
        testResults.push({ test: 'Form Interaction', status: 'PASS' });
      } else {
        throw new Error('Cannot interact with form - input not found');
      }
      
    } catch (error) {
      console.log('❌ Form interaction failed');
      testResults.push({ test: 'Form Interaction', status: 'FAIL', error: error.message });
    }
    
  } catch (error) {
    console.log('💥 Fatal error:', error.message);
    testResults.push({ test: 'Browser Launch', status: 'FAIL', error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Test Results Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${total > 0 ? Math.round((passed / total) * 100) : 0}%`);
  
  console.log('\nDetailed Results:');
  testResults.forEach(result => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Category creation UI is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check server status and try again.');
  }
  
  return { passed, failed, total, results: testResults };
}

// Run the tests
if (require.main === module) {
  runCategoryCreationTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runCategoryCreationTests };
