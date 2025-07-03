const puppeteer = require('puppeteer');

async function debugCategoryCreation() {
  console.log('🎯 Focused 400 Error Debug\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture network activity
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      if (request.url().includes('/categories')) {
        requests.push({
          method: request.method(),
          url: request.url(),
          payload: request.postData(),
          headers: request.headers()
        });
        console.log(`📤 ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`   Payload: ${request.postData()}`);
        }
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/categories')) {
        console.log(`📥 ${response.status()} ${response.url()}`);
        
        response.text().then(text => {
          responses.push({
            status: response.status(),
            url: response.url(),
            body: text
          });
          
          if (response.status() >= 400) {
            console.log(`❌ ERROR: ${text}`);
          } else {
            console.log(`✅ SUCCESS: ${text.substring(0, 100)}...`);
          }
        }).catch(() => {});
      }
    });
    
    // Login
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3000/login');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) adminButton.click();
    });
    
    await page.waitForTimeout(3000);
    
    // Navigate to category creation
    console.log('📝 Going to category creation page...');
    await page.goto('http://localhost:3000/products/categories/new');
    await page.waitForTimeout(5000);
    
    // Fill form
    console.log('🖊️ Filling form...');
    
    const categoryName = `Debug Test ${Date.now()}`;
    
    // Wait for form to be ready
    await page.waitForSelector('input[id="category-name"]');
    
    // Clear and type category name
    await page.click('input[id="category-name"]', { clickCount: 3 });
    await page.type('input[id="category-name"]', categoryName);
    
    console.log(`   Category name: ${categoryName}`);
    
    // Check dropdown state
    await page.waitForTimeout(2000);
    
    const dropdownState = await page.evaluate(() => {
      const combobox = document.querySelector('[role="combobox"]');
      return {
        text: combobox?.textContent?.trim(),
        value: combobox?.getAttribute('data-value'),
        disabled: combobox?.hasAttribute('disabled')
      };
    });
    
    console.log('   Dropdown state:', dropdownState);
    
    // Make sure parent category is selected (should default to root)
    if (!dropdownState.text?.includes('Root')) {
      console.log('   Setting parent category to root...');
      await page.click('[role="combobox"]');
      await page.waitForTimeout(1000);
      
      // Find and click root option
      await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('[role="option"]'));
        const rootOption = options.find(opt => opt.textContent.includes('Root'));
        if (rootOption) rootOption.click();
      });
      
      await page.waitForTimeout(500);
    }
    
    // Get final form state before submission
    const finalState = await page.evaluate(() => {
      const nameInput = document.querySelector('input[id="category-name"]');
      const combobox = document.querySelector('[role="combobox"]');
      const isLeafSwitch = document.querySelector('[role="switch"]');
      
      return {
        categoryName: nameInput?.value,
        parentText: combobox?.textContent?.trim(),
        isLeaf: isLeafSwitch?.getAttribute('aria-checked') === 'true'
      };
    });
    
    console.log('📊 Final form state:', finalState);
    
    // Submit form
    console.log('🚀 Submitting form...');
    
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      
      // Wait for network activity to complete
      await page.waitForTimeout(5000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Check for notifications
      const notifications = await page.evaluate(() => {
        const alerts = document.querySelectorAll('[role="alert"]');
        return Array.from(alerts).map(alert => ({
          text: alert.textContent?.trim(),
          class: alert.className
        }));
      });
      
      if (notifications.length > 0) {
        console.log('📢 Notifications:');
        notifications.forEach(notif => console.log(`   - ${notif.text}`));
      }
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`Requests made: ${requests.length}`);
    console.log(`Responses received: ${responses.length}`);
    
    const failedRequests = responses.filter(r => r.status >= 400);
    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED REQUESTS:');
      failedRequests.forEach((resp, i) => {
        console.log(`${i + 1}. ${resp.status} - ${resp.url}`);
        console.log(`   Response: ${resp.body}`);
        
        const matchingReq = requests.find(r => r.url === resp.url);
        if (matchingReq) {
          console.log(`   Request payload: ${matchingReq.payload}`);
        }
      });
    } else {
      console.log('✅ All requests successful!');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  } finally {
    console.log('\n🔍 Check browser for manual inspection...');
    await page.waitForTimeout(30000); // Keep browser open for inspection
    await browser.close();
  }
}

debugCategoryCreation().catch(console.error);