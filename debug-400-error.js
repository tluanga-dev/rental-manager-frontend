const puppeteer = require('puppeteer');

async function debug400Error() {
  console.log('🐛 Debugging 400 Error During Category Creation\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    devtools: true
  });
  
  try {
    const page = await browser.newPage();
    
    // Track all network requests and responses
    const networkLogs = [];
    
    // Intercept all network requests
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      
      // Log request details for API calls
      if (request.url().includes('/api/v1/categories')) {
        const headers = request.headers();
        const postData = request.postData();
        
        networkLogs.push({
          type: 'request',
          method: request.method(),
          url: request.url(),
          headers: headers,
          payload: postData ? JSON.parse(postData) : null,
          timestamp: new Date().toISOString()
        });
        
        console.log('   📋 Headers:', JSON.stringify(headers, null, 2));
        if (postData) {
          console.log('   📦 Payload:', postData);
        }
      }
      
      request.continue();
    });
    
    page.on('response', (response) => {
      if (response.url().includes('/api/v1/categories')) {
        console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
        
        // Store response info
        response.text().then(body => {
          networkLogs.push({
            type: 'response',
            status: response.status(),
            url: response.url(),
            headers: response.headers(),
            body: body,
            timestamp: new Date().toISOString()
          });
          
          console.log(`   📊 Status: ${response.status()}`);
          console.log(`   📄 Response Body:`, body);
          
          if (response.status() >= 400) {
            console.log(`   ❌ ERROR RESPONSE: ${body}`);
          }
        }).catch(err => {
          console.log(`   ⚠️ Could not read response body: ${err.message}`);
        });
      }
    });
    
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
        console.log(`🔴 CONSOLE ERROR: ${text}`);
      }
    });
    
    // Step 1: Login
    console.log('1️⃣ Logging in as admin...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    // Click admin demo button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) {
        adminButton.click();
        return true;
      }
      return false;
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('   ✅ Login completed');
    
    // Step 2: Navigate to category creation
    console.log('2️⃣ Navigating to category creation page...');
    await page.goto('http://localhost:3000/products/categories/new', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('   ✅ Page loaded');
    
    // Step 3: Fill form and track every step
    console.log('3️⃣ Filling form step by step...');
    
    // Fill category name
    const categoryName = `Test Debug Category ${Date.now()}`;
    console.log(`   📝 Typing category name: "${categoryName}"`);
    
    await page.waitForSelector('input[id="category-name"]', { timeout: 10000 });
    await page.click('input[id="category-name"]');
    await page.keyboard.down('Meta');
    await page.keyboard.press('a');
    await page.keyboard.up('Meta');
    await page.type('input[id="category-name"]', categoryName);
    
    // Check current form state
    const formState = await page.evaluate(() => {
      const nameInput = document.querySelector('input[id="category-name"]');
      const combobox = document.querySelector('[role="combobox"]');
      
      return {
        categoryName: nameInput?.value || '',
        parentDropdownText: combobox?.textContent || '',
        comboboxValue: combobox?.getAttribute('aria-expanded') || 'false'
      };
    });
    
    console.log('   📊 Form State:', JSON.stringify(formState, null, 2));
    
    // Check parent category dropdown
    console.log('   🔽 Checking parent category dropdown...');
    
    // Click the dropdown to open it
    await page.click('[role="combobox"]');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check available options
    const options = await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll('[role="option"]'));
      return opts.map(opt => ({
        text: opt.textContent.trim(),
        value: opt.getAttribute('data-value') || 'no-value'
      }));
    });
    
    console.log('   📋 Available options:', JSON.stringify(options, null, 2));
    
    // Select root category if available
    if (options.length > 0) {
      const rootOption = options.find(opt => opt.text.includes('Root'));
      if (rootOption) {
        console.log('   🎯 Selecting root category...');
        
        await page.evaluate(() => {
          const opts = Array.from(document.querySelectorAll('[role="option"]'));
          const rootOpt = opts.find(opt => opt.textContent.includes('Root'));
          if (rootOpt) {
            rootOpt.click();
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      console.log('   ⚠️ No options found in dropdown');
    }
    
    // Step 4: Submit form and monitor closely
    console.log('4️⃣ Submitting form...');
    
    // Take screenshot before submission
    await page.screenshot({ path: './screenshots/before-submit.png', fullPage: true });
    
    // Get final form values before submission
    const finalFormValues = await page.evaluate(() => {
      const nameInput = document.querySelector('input[id="category-name"]');
      const combobox = document.querySelector('[role="combobox"]');
      const leafSwitch = document.querySelector('[role="switch"]');
      const description = document.querySelector('textarea');
      
      return {
        categoryName: nameInput?.value || '',
        parentCategory: combobox?.getAttribute('data-value') || combobox?.textContent || '',
        isLeaf: leafSwitch?.getAttribute('aria-checked') === 'true',
        description: description?.value || ''
      };
    });
    
    console.log('   📝 Final form values:', JSON.stringify(finalFormValues, null, 2));
    
    // Click submit button
    console.log('   🚀 Clicking submit button...');
    const submitButton = await page.$('button[type="submit"]');
    
    if (submitButton) {
      await submitButton.click();
      console.log('   ⏳ Waiting for API response...');
      
      // Wait for either success or error
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`   📍 Current URL after submit: ${currentUrl}`);
      
      // Take screenshot after submission
      await page.screenshot({ path: './screenshots/after-submit.png', fullPage: true });
      
      // Check for any notifications
      const notifications = await page.evaluate(() => {
        const alerts = document.querySelectorAll('[role="alert"]');
        return Array.from(alerts).map(alert => alert.textContent.trim());
      });
      
      if (notifications.length > 0) {
        console.log('   📢 Notifications:', notifications);
      }
    } else {
      console.log('   ❌ Submit button not found');
    }
    
    // Step 5: Analyze all collected data
    console.log('\n5️⃣ Analysis Summary:');
    
    // Network requests analysis
    const apiRequests = networkLogs.filter(log => log.type === 'request');
    const apiResponses = networkLogs.filter(log => log.type === 'response');
    
    console.log(`   📊 Total API requests: ${apiRequests.length}`);
    console.log(`   📊 Total API responses: ${apiResponses.length}`);
    
    // Find the failed requests
    const failedResponses = apiResponses.filter(res => res.status >= 400);
    
    if (failedResponses.length > 0) {
      console.log('\n   ❌ FAILED REQUESTS:');
      failedResponses.forEach((response, index) => {
        console.log(`   \n   Failed Request #${index + 1}:`);
        console.log(`     Status: ${response.status}`);
        console.log(`     URL: ${response.url}`);
        console.log(`     Response: ${response.body}`);
        
        // Find matching request
        const matchingRequest = apiRequests.find(req => 
          req.url === response.url && 
          Math.abs(new Date(req.timestamp) - new Date(response.timestamp)) < 5000
        );
        
        if (matchingRequest) {
          console.log(`     Request Payload: ${JSON.stringify(matchingRequest.payload, null, 2)}`);
          console.log(`     Request Headers: ${JSON.stringify(matchingRequest.headers, null, 2)}`);
        }
      });
    }
    
    // Console errors
    if (consoleErrors.length > 0) {
      console.log('\n   🔴 CONSOLE ERRORS:');
      consoleErrors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    }
    
    // Save all debug data
    const debugData = {
      formValues: finalFormValues,
      networkLogs: networkLogs,
      consoleErrors: consoleErrors,
      timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('./debug-400-data.json', JSON.stringify(debugData, null, 2));
    console.log('\n   💾 Debug data saved to debug-400-data.json');
    
  } catch (error) {
    console.error('\n❌ Debug session failed:', error.message);
  } finally {
    console.log('\n🎬 Debug session complete. Check the data above for the root cause.');
    console.log('Browser will remain open for manual inspection...');
    
    // Keep browser open for manual inspection
    await new Promise(resolve => setTimeout(resolve, 60000));
    await browser.close();
  }
}

// Ensure screenshots directory exists
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

// Run the debug session
debug400Error().catch(console.error);