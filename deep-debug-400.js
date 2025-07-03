const puppeteer = require('puppeteer');

async function deepDebug() {
  console.log('🔍 Deep Debug - Category Creation Issue\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    devtools: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  try {
    const page = await browser.newPage();
    
    // Comprehensive logging
    const networkLogs = [];
    const consoleLogs = [];
    
    // Track ALL network activity
    page.on('request', request => {
      if (request.url().includes('localhost:8000') || request.url().includes('categories')) {
        console.log(`🔸 REQUEST: ${request.method()} ${request.url()}`);
        
        const headers = request.headers();
        if (request.postData()) {
          console.log(`   📦 Body: ${request.postData()}`);
        }
        
        networkLogs.push({
          type: 'request',
          method: request.method(),
          url: request.url(),
          headers: headers,
          body: request.postData(),
          timestamp: Date.now()
        });
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('localhost:8000') || response.url().includes('categories')) {
        console.log(`🔹 RESPONSE: ${response.status()} ${response.url()}`);
        
        try {
          const responseBody = await response.text();
          console.log(`   📄 Response: ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`);
          
          networkLogs.push({
            type: 'response',
            status: response.status(),
            url: response.url(),
            headers: response.headers(),
            body: responseBody,
            timestamp: Date.now()
          });
          
          if (response.status() >= 400) {
            console.log(`❌ ERROR RESPONSE: ${responseBody}`);
          }
        } catch (e) {
          console.log(`   ⚠️ Could not read response body`);
        }
      }
    });
    
    // Track console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push({ type: msg.type(), text, timestamp: Date.now() });
      
      if (msg.type() === 'error' || text.includes('error') || text.includes('Error') || text.includes('payload')) {
        console.log(`🔴 CONSOLE ${msg.type().toUpperCase()}: ${text}`);
      }
    });
    
    // Page errors
    page.on('pageerror', error => {
      console.log(`💥 PAGE ERROR: ${error.message}`);
    });
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) {
        adminButton.click();
        return true;
      }
      return false;
    });
    
    await page.waitForTimeout(3000);
    console.log('   ✅ Login complete');
    
    // Step 2: Navigate to category page
    console.log('2️⃣ Navigating to category creation...');
    await page.goto('http://localhost:3000/products/categories/new', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    console.log('   ✅ Page loaded');
    
    // Check if form elements exist
    const formElements = await page.evaluate(() => {
      return {
        categoryNameInput: !!document.querySelector('input[id="category-name"]'),
        combobox: !!document.querySelector('[role="combobox"]'),
        submitButton: !!document.querySelector('button[type="submit"]'),
        formCount: document.querySelectorAll('form').length,
        inputCount: document.querySelectorAll('input').length,
        buttonCount: document.querySelectorAll('button').length
      };
    });
    
    console.log('3️⃣ Form elements check:', JSON.stringify(formElements, null, 2));
    
    if (!formElements.categoryNameInput) {
      console.log('❌ Category name input not found!');
      
      // Take screenshot for debugging
      await page.screenshot({ path: './screenshots/missing-form.png', fullPage: true });
      
      // Check what's actually on the page
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body.textContent.substring(0, 500),
          h1Text: document.querySelector('h1')?.textContent,
          errorElements: Array.from(document.querySelectorAll('[role="alert"]')).map(el => el.textContent)
        };
      });
      
      console.log('📄 Page content:', JSON.stringify(pageContent, null, 2));
      return;
    }
    
    // Step 3: Fill form
    console.log('4️⃣ Filling form...');
    
    const categoryName = `Deep Debug Test ${Date.now()}`;
    
    // Fill category name
    await page.focus('input[id="category-name"]');
    await page.keyboard.down('Meta');
    await page.keyboard.press('a');
    await page.keyboard.up('Meta');
    await page.type('input[id="category-name"]', categoryName);
    
    console.log(`   📝 Category name: ${categoryName}`);
    
    // Wait for categories to load and check dropdown
    await page.waitForTimeout(3000);
    
    const dropdownInfo = await page.evaluate(() => {
      const combobox = document.querySelector('[role="combobox"]');
      if (!combobox) return { error: 'Combobox not found' };
      
      return {
        text: combobox.textContent?.trim(),
        disabled: combobox.hasAttribute('disabled'),
        ariaExpanded: combobox.getAttribute('aria-expanded'),
        className: combobox.className
      };
    });
    
    console.log('   🔽 Dropdown info:', JSON.stringify(dropdownInfo, null, 2));
    
    // Try to open dropdown
    if (dropdownInfo && !dropdownInfo.error) {
      console.log('   📋 Opening dropdown...');
      await page.click('[role="combobox"]');
      await page.waitForTimeout(1000);
      
      const options = await page.evaluate(() => {
        const opts = Array.from(document.querySelectorAll('[role="option"]'));
        return opts.map(opt => ({
          text: opt.textContent?.trim(),
          value: opt.getAttribute('data-value') || opt.getAttribute('value')
        }));
      });
      
      console.log(`   📋 Found ${options.length} options:`, options.slice(0, 3));
      
      // Select root option
      const rootSelected = await page.evaluate(() => {
        const opts = Array.from(document.querySelectorAll('[role="option"]'));
        const rootOpt = opts.find(opt => opt.textContent?.includes('Root'));
        if (rootOpt) {
          rootOpt.click();
          return true;
        }
        return false;
      });
      
      console.log(`   🎯 Root option selected: ${rootSelected}`);
      await page.waitForTimeout(500);
    }
    
    // Step 4: Submit form
    console.log('5️⃣ Submitting form...');
    
    // Get form state before submission
    const formState = await page.evaluate(() => {
      const nameInput = document.querySelector('input[id="category-name"]');
      const combobox = document.querySelector('[role="combobox"]');
      const leafSwitch = document.querySelector('[role="switch"]');
      
      return {
        categoryName: nameInput?.value,
        parentText: combobox?.textContent?.trim(),
        isLeaf: leafSwitch?.getAttribute('aria-checked') === 'true',
        submitButtonExists: !!document.querySelector('button[type="submit"]')
      };
    });
    
    console.log('   📊 Form state:', JSON.stringify(formState, null, 2));
    
    // Take screenshot before submit
    await page.screenshot({ path: './screenshots/before-submit.png', fullPage: true });
    
    // Submit
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      console.log('   🚀 Form submitted!');
      
      // Wait for network activity
      await page.waitForTimeout(5000);
      
      // Check final state
      const currentUrl = page.url();
      console.log(`   📍 Final URL: ${currentUrl}`);
      
      // Take final screenshot
      await page.screenshot({ path: './screenshots/after-submit.png', fullPage: true });
      
    } else {
      console.log('   ❌ Submit button not found');
    }
    
    // Step 5: Analysis
    console.log('\n📊 FINAL ANALYSIS:');
    
    const categoryRequests = networkLogs.filter(log => 
      log.url.includes('/categories') && log.type === 'request'
    );
    const categoryResponses = networkLogs.filter(log => 
      log.url.includes('/categories') && log.type === 'response'
    );
    
    console.log(`Network activity: ${categoryRequests.length} requests, ${categoryResponses.length} responses`);
    
    categoryRequests.forEach((req, i) => {
      console.log(`Request ${i + 1}: ${req.method} ${req.url}`);
      if (req.body) console.log(`  Body: ${req.body}`);
    });
    
    categoryResponses.forEach((resp, i) => {
      console.log(`Response ${i + 1}: ${resp.status} ${resp.url}`);
      if (resp.status >= 400) {
        console.log(`  Error: ${resp.body}`);
      }
    });
    
    const errorLogs = consoleLogs.filter(log => 
      log.type === 'error' || log.text.includes('error') || log.text.includes('Error')
    );
    
    if (errorLogs.length > 0) {
      console.log('\n🔴 Console Errors:');
      errorLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log.text}`);
      });
    }
    
    // Save debug data
    const debugData = {
      networkLogs,
      consoleLogs,
      formState,
      dropdownInfo,
      formElements,
      timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('./deep-debug-data.json', JSON.stringify(debugData, null, 2));
    console.log('\n💾 Debug data saved to deep-debug-data.json');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    console.log('\n🎬 Keeping browser open for manual inspection...');
    // Keep browser open for manual inspection
    await page.waitForTimeout(60000);
    await browser.close();
  }
}

// Ensure screenshots directory exists
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

deepDebug().catch(console.error);