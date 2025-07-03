const puppeteer = require('puppeteer');

// List of all URLs to test
const urls = [
  { path: '/', name: 'Home/Root', expectedRedirect: true },
  { path: '/login', name: 'Login Page', publicRoute: true },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/sales', name: 'Sales Overview' },
  { path: '/sales/new', name: 'New Sale' },
  { path: '/sales/history', name: 'Sales History' },
  { path: '/sales/123', name: 'Sale Details (Dynamic)' },
  { path: '/rentals', name: 'Rentals Overview' },
  { path: '/rentals/new', name: 'New Rental' },
  { path: '/rentals/active', name: 'Active Rentals' },
  { path: '/rentals/history', name: 'Rental History' },
  { path: '/products', name: 'Products Overview' },
  { path: '/products/categories', name: 'Product Categories' },
  { path: '/products/categories/new', name: 'New Category' },
  { path: '/products/brands', name: 'Brands' },
  { path: '/products/items', name: 'Item Masters' },
  { path: '/products/skus', name: 'SKUs' },
  { path: '/purchases', name: 'Purchases Overview' },
  { path: '/purchases/receive', name: 'Receive Inventory' },
];

const testResults = [];
const BASE_URL = 'http://localhost:3000';

async function testAllUrls() {
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for CI/CD
    slowMo: 50 
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Starting URL testing...\n');
    
    // Test each URL
    for (const urlInfo of urls) {
      const fullUrl = BASE_URL + urlInfo.path;
      const result = {
        name: urlInfo.name,
        url: fullUrl,
        path: urlInfo.path,
        timestamp: new Date().toISOString()
      };
      
      try {
        console.log(`Testing: ${urlInfo.name} (${urlInfo.path})`);
        
        // Navigate to URL
        const response = await page.goto(fullUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Get final URL after any redirects
        const finalUrl = page.url();
        result.finalUrl = finalUrl;
        result.statusCode = response.status();
        
        // Check if redirected
        if (finalUrl !== fullUrl) {
          result.redirected = true;
          result.redirectedTo = finalUrl.replace(BASE_URL, '');
        }
        
        // Wait for content to load
        await page.waitForTimeout(1000);
        
        // Check for common error indicators
        const pageContent = await page.content();
        const hasError = pageContent.includes('Error') || 
                        pageContent.includes('404') || 
                        pageContent.includes('not found');
        
        // Take screenshot
        const screenshotPath = `./screenshots/${urlInfo.path.replace(/\//g, '_')}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        result.screenshot = screenshotPath;
        
        // Get page title
        result.pageTitle = await page.title();
        
        // Check for specific elements based on route
        if (urlInfo.path === '/login' || (result.redirected && result.redirectedTo === '/login')) {
          const loginForm = await page.$('form');
          result.hasLoginForm = !!loginForm;
        }
        
        // Check for main layout elements (for authenticated pages)
        if (!urlInfo.publicRoute && !result.redirectedTo?.includes('/login')) {
          const sidebar = await page.$('[class*="sidebar"]');
          const navbar = await page.$('[class*="navbar"], [class*="header"]');
          result.hasLayout = {
            sidebar: !!sidebar,
            navbar: !!navbar
          };
        }
        
        // Performance metrics
        const performanceMetrics = await page.evaluate(() => {
          const timing = performance.timing;
          return {
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
          };
        });
        result.performance = performanceMetrics;
        
        // Console errors/warnings
        const consoleLogs = [];
        page.on('console', msg => {
          if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleLogs.push({
              type: msg.type(),
              text: msg.text()
            });
          }
        });
        
        result.status = hasError ? 'error' : 'success';
        result.consoleLogs = consoleLogs;
        
        console.log(`✓ Completed: ${urlInfo.name}`);
        
      } catch (error) {
        console.log(`✗ Failed: ${urlInfo.name} - ${error.message}`);
        result.status = 'failed';
        result.error = error.message;
      }
      
      testResults.push(result);
      console.log('---\n');
    }
    
    // Generate summary report
    generateReport();
    
  } finally {
    await browser.close();
  }
}

function generateReport() {
  console.log('\n=== TEST SUMMARY ===\n');
  
  const successful = testResults.filter(r => r.status === 'success').length;
  const failed = testResults.filter(r => r.status === 'failed').length;
  const errors = testResults.filter(r => r.status === 'error').length;
  
  console.log(`Total URLs tested: ${testResults.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Errors: ${errors}`);
  
  console.log('\n=== DETAILED RESULTS ===\n');
  
  testResults.forEach(result => {
    console.log(`${result.name} (${result.path})`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Final URL: ${result.finalUrl}`);
    if (result.redirected) {
      console.log(`  Redirected to: ${result.redirectedTo}`);
    }
    if (result.pageTitle) {
      console.log(`  Page Title: ${result.pageTitle}`);
    }
    if (result.performance) {
      console.log(`  Load Time: ${result.performance.loadTime}ms`);
    }
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
  });
  
  // Save results to JSON file
  const fs = require('fs');
  fs.writeFileSync(
    './test-results.json', 
    JSON.stringify(testResults, null, 2)
  );
  console.log('Full results saved to test-results.json');
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

// Run the tests
testAllUrls().catch(console.error);