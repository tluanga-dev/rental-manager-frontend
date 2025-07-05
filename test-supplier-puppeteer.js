const puppeteer = require('puppeteer');

async function testSupplierAPI() {
  let browser;
  try {
    console.log('🚀 Starting Puppeteer test for Supplier API...');
    
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable request/response logging
    page.on('request', request => {
      if (request.url().includes('suppliers') || request.url().includes('customers')) {
        console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('suppliers') || response.url().includes('customers')) {
        console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to dashboard
    console.log('📄 Navigating to dashboard...');
    await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle0' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Test if we can login or if we're already logged in
    const isLoggedIn = await page.$('[data-testid="dashboard"]') || 
                      await page.$('text=Dashboard') ||
                      await page.$('.supplier-selector') ||
                      await page.$('[role="combobox"]');
    
    if (!isLoggedIn) {
      console.log('🔑 Need to login first...');
      // Try to find login elements and login
      const loginButton = await page.$('button:contains("Login")') || 
                         await page.$('[data-testid="login-button"]') ||
                         await page.$('input[type="email"]');
      
      if (loginButton) {
        console.log('🔐 Found login form, attempting login...');
        // Add demo login if needed
        await page.type('input[type="email"]', 'admin@test.com', { delay: 100 });
        await page.type('input[type="password"]', 'password', { delay: 100 });
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      }
    }
    
    // Test direct API calls
    console.log('🔍 Testing API endpoints directly...');
    
    const apiTests = [
      'http://localhost:8000/api/v1/suppliers/',
      'http://localhost:8000/api/v1/suppliers/?skip=0&limit=10',
      'http://localhost:8000/api/v1/suppliers/?skip=0&limit=10&is_active=true',
      'http://localhost:3001/api/v1/suppliers/?skip=0&limit=10&is_active=true', // Frontend proxy
      'http://localhost:8000/api/v1/customers/?customer_type=BUSINESS&skip=0&limit=10'
    ];
    
    for (const url of apiTests) {
      try {
        console.log(`\n🧪 Testing: ${url}`);
        const response = await page.evaluate(async (testUrl) => {
          const token = localStorage.getItem('accessToken');
          try {
            const res = await fetch(testUrl, {
              headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              } : {
                'Content-Type': 'application/json'
              }
            });
            return {
              status: res.status,
              statusText: res.statusText,
              ok: res.ok,
              data: res.ok ? await res.json() : await res.text()
            };
          } catch (error) {
            return {
              error: error.message,
              status: 0
            };
          }
        }, url);
        
        if (response.error) {
          console.log(`❌ Error: ${response.error}`);
        } else {
          console.log(`📊 Status: ${response.status} ${response.statusText}`);
          if (response.ok && response.data.items) {
            console.log(`✅ Success: Found ${response.data.items.length} items`);
            if (response.data.items.length > 0) {
              console.log(`📋 Sample: ${JSON.stringify(response.data.items[0], null, 2).slice(0, 200)}...`);
            }
          } else if (!response.ok) {
            console.log(`❌ Failed: ${JSON.stringify(response.data).slice(0, 200)}`);
          }
        }
      } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
      }
    }
    
    // Test supplier selector component
    console.log('\n🎯 Testing Supplier Selector Component...');
    
    try {
      // Look for supplier selector
      const supplierSelector = await page.$('[role="combobox"]');
      if (supplierSelector) {
        console.log('✅ Found supplier selector component');
        
        // Click to open dropdown
        await supplierSelector.click();
        await page.waitForTimeout(2000);
        
        // Check for dropdown content
        const dropdown = await page.$('.popover-content, [role="listbox"]');
        if (dropdown) {
          console.log('✅ Dropdown opened');
          
          // Check for loading state
          const loading = await page.$('text=Loading');
          if (loading) {
            console.log('⏳ Loading state detected');
            await page.waitForTimeout(3000);
          }
          
          // Check for suppliers in dropdown
          const suppliers = await page.$$('text=company, text=supplier');
          console.log(`📋 Found ${suppliers.length} supplier-like elements in dropdown`);
          
          // Check for error messages
          const error = await page.$('text=error, text=failed, text=404');
          if (error) {
            const errorText = await page.evaluate(el => el.textContent, error);
            console.log(`❌ Error in dropdown: ${errorText}`);
          }
          
        } else {
          console.log('❌ Dropdown did not open');
        }
      } else {
        console.log('❌ Supplier selector component not found');
        
        // Check what's actually on the page
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        const url = await page.url();
        console.log(`🔗 Current URL: ${url}`);
        
        // Screenshot for debugging
        await page.screenshot({ path: 'supplier-test-debug.png', fullPage: true });
        console.log('📸 Screenshot saved as supplier-test-debug.png');
      }
    } catch (error) {
      console.log(`❌ Component test failed: ${error.message}`);
    }
    
    // Check backend API availability
    console.log('\n🔧 Checking Backend Status...');
    try {
      const backendHealth = await page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:8000/health');
          return {
            status: response.status,
            ok: response.ok,
            data: await response.text()
          };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      if (backendHealth.error) {
        console.log(`❌ Backend not accessible: ${backendHealth.error}`);
      } else {
        console.log(`✅ Backend accessible: ${backendHealth.status}`);
      }
    } catch (error) {
      console.log(`❌ Backend check failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    if (browser) {
      console.log('\n🏁 Test completed. Check the browser window for more details.');
      // Don't close browser immediately for debugging
      // await browser.close();
    }
  }
}

// Run the test
testSupplierAPI().catch(console.error);
