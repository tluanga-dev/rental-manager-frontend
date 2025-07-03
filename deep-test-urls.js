const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000';

// List of all URLs to test
const urls = [
  { path: '/', name: 'Home/Root', requiresAuth: false },
  { path: '/login', name: 'Login Page', requiresAuth: false },
  { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
  { path: '/sales', name: 'Sales Overview', requiresAuth: true },
  { path: '/sales/new', name: 'New Sale', requiresAuth: true },
  { path: '/sales/history', name: 'Sales History', requiresAuth: true },
  { path: '/sales/123', name: 'Sale Details (Dynamic)', requiresAuth: true },
  { path: '/rentals', name: 'Rentals Overview', requiresAuth: true },
  { path: '/rentals/new', name: 'New Rental', requiresAuth: true },
  { path: '/rentals/active', name: 'Active Rentals', requiresAuth: true },
  { path: '/rentals/history', name: 'Rental History', requiresAuth: true },
  { path: '/products', name: 'Products Overview', requiresAuth: true },
  { path: '/products/categories', name: 'Product Categories', requiresAuth: true },
  { path: '/products/categories/new', name: 'New Category', requiresAuth: true },
  { path: '/products/brands', name: 'Brands', requiresAuth: true },
  { path: '/products/items', name: 'Item Masters', requiresAuth: true },
  { path: '/products/skus', name: 'SKUs', requiresAuth: true },
  { path: '/purchases', name: 'Purchases Overview', requiresAuth: true },
  { path: '/purchases/receive', name: 'Receive Inventory', requiresAuth: true },
];

// Demo credentials
const DEMO_CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123' },
  manager: { username: 'manager', password: 'manager123' },
  staff: { username: 'staff', password: 'staff123' }
};

async function loginWithDemoButton(page, role = 'admin') {
  console.log(`Logging in as ${role}...`);
  
  // Navigate to login page
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  
  // Click the appropriate demo button
  const buttonText = role === 'admin' ? 'Demo as Administrator' : 
                    role === 'manager' ? 'Demo as Manager' : 
                    'Demo as Staff';
  
  // Find and click the button by text content
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await button.evaluate(el => el.textContent);
    if (text && text.trim() === buttonText) {
      await button.click();
      break;
    }
  }
  
  // Wait for navigation to complete
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  console.log('Login successful!');
}

async function testUrl(page, urlInfo) {
  const fullUrl = BASE_URL + urlInfo.path;
  const result = {
    name: urlInfo.name,
    url: fullUrl,
    path: urlInfo.path,
    timestamp: new Date().toISOString(),
    requiresAuth: urlInfo.requiresAuth
  };
  
  try {
    console.log(`\nTesting: ${urlInfo.name} (${urlInfo.path})`);
    
    // Navigate to URL
    const response = await page.goto(fullUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Get final URL after any redirects
    const finalUrl = page.url();
    result.finalUrl = finalUrl;
    result.statusCode = response ? response.status() : null;
    
    // Check if redirected
    if (finalUrl !== fullUrl) {
      result.redirected = true;
      result.redirectedTo = finalUrl.replace(BASE_URL, '');
      console.log(`  → Redirected to: ${result.redirectedTo}`);
    }
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get page title
    result.pageTitle = await page.title();
    console.log(`  → Page Title: ${result.pageTitle}`);
    
    // Check page content
    const pageContent = await page.evaluate(() => {
      const body = document.body;
      return {
        hasContent: body && body.textContent.trim().length > 0,
        textLength: body ? body.textContent.trim().length : 0,
        hasError: body ? body.textContent.includes('Error') || 
                        body.textContent.includes('404') || 
                        body.textContent.includes('not found') : false,
        elementsCount: {
          buttons: document.querySelectorAll('button').length,
          links: document.querySelectorAll('a').length,
          inputs: document.querySelectorAll('input').length,
          tables: document.querySelectorAll('table').length,
          forms: document.querySelectorAll('form').length
        }
      };
    });
    
    result.pageContent = pageContent;
    console.log(`  → Elements: ${JSON.stringify(pageContent.elementsCount)}`);
    
    // Check for main layout components
    const layoutCheck = await page.evaluate(() => {
      return {
        hasSidebar: !!document.querySelector('[class*="sidebar"], aside'),
        hasNavbar: !!document.querySelector('[class*="navbar"], [class*="header"], nav'),
        hasMainContent: !!document.querySelector('main, [class*="main-content"]'),
        hasFooter: !!document.querySelector('footer')
      };
    });
    
    result.layout = layoutCheck;
    console.log(`  → Layout: ${JSON.stringify(layoutCheck)}`);
    
    // Take screenshot
    const screenshotDir = './screenshots';
    const fs = require('fs');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    const screenshotPath = `${screenshotDir}${urlInfo.path.replace(/\//g, '_')}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    result.screenshot = screenshotPath;
    console.log(`  → Screenshot saved: ${screenshotPath}`);
    
    // Check console errors
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });
    
    result.consoleLogs = consoleLogs;
    result.status = pageContent.hasError ? 'error' : 'success';
    
    console.log(`  ✓ Status: ${result.status}`);
    
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    result.status = 'failed';
    result.error = error.message;
  }
  
  return result;
}

async function runDeepTest() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const testResults = [];
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('=== DEEP URL TESTING STARTED ===\n');
    console.log(`Frontend URL: ${BASE_URL}`);
    console.log(`Backend URL: ${API_URL}`);
    console.log(`Total URLs to test: ${urls.length}\n`);
    
    // Test unauthenticated URLs first
    console.log('--- Testing Unauthenticated Routes ---');
    for (const urlInfo of urls.filter(u => !u.requiresAuth)) {
      const result = await testUrl(page, urlInfo);
      testResults.push(result);
    }
    
    // Login and test authenticated routes
    console.log('\n--- Logging in for Authenticated Routes ---');
    await loginWithDemoButton(page, 'admin');
    
    console.log('\n--- Testing Authenticated Routes ---');
    for (const urlInfo of urls.filter(u => u.requiresAuth)) {
      const result = await testUrl(page, urlInfo);
      testResults.push(result);
    }
    
    // Generate detailed report
    generateDetailedReport(testResults);
    
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await browser.close();
  }
}

function generateDetailedReport(results) {
  console.log('\n\n=== DEEP TEST SUMMARY REPORT ===\n');
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`Total URLs tested: ${results.length}`);
  console.log(`✓ Successful: ${successful}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`⚠ Errors: ${errors}`);
  
  // Group results by status
  console.log('\n--- SUCCESSFUL PAGES ---');
  results.filter(r => r.status === 'success').forEach(r => {
    console.log(`✓ ${r.name} (${r.path})`);
    if (r.redirected) console.log(`  → Redirected to: ${r.redirectedTo}`);
  });
  
  if (failed > 0) {
    console.log('\n--- FAILED PAGES ---');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`✗ ${r.name} (${r.path})`);
      console.log(`  Error: ${r.error}`);
    });
  }
  
  if (errors > 0) {
    console.log('\n--- PAGES WITH ERRORS ---');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`⚠ ${r.name} (${r.path})`);
      if (r.pageContent) {
        console.log(`  Content indicates error`);
      }
    });
  }
  
  // Layout analysis
  console.log('\n--- LAYOUT ANALYSIS ---');
  const authenticatedResults = results.filter(r => r.requiresAuth && r.layout);
  const layoutStats = {
    withSidebar: authenticatedResults.filter(r => r.layout?.hasSidebar).length,
    withNavbar: authenticatedResults.filter(r => r.layout?.hasNavbar).length,
    withMainContent: authenticatedResults.filter(r => r.layout?.hasMainContent).length
  };
  console.log(`Pages with sidebar: ${layoutStats.withSidebar}/${authenticatedResults.length}`);
  console.log(`Pages with navbar: ${layoutStats.withNavbar}/${authenticatedResults.length}`);
  console.log(`Pages with main content: ${layoutStats.withMainContent}/${authenticatedResults.length}`);
  
  // Save detailed results to JSON
  const fs = require('fs');
  fs.writeFileSync(
    './deep-test-results.json', 
    JSON.stringify(results, null, 2)
  );
  console.log('\n✓ Full results saved to deep-test-results.json');
  console.log('✓ Screenshots saved to ./screenshots/');
}

// Run the deep test
runDeepTest().catch(console.error);