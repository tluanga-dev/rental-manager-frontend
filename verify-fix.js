const puppeteer = require('puppeteer');

async function verifyFix() {
  console.log('✅ Verifying Category Creation Fix\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Track network requests for categories
    const categoryRequests = [];
    
    page.on('response', response => {
      if (response.url().includes('/categories')) {
        const status = response.status();
        console.log(`📡 ${response.request().method()} ${response.url()} → ${status}`);
        
        if (status >= 400) {
          response.text().then(text => {
            console.log(`❌ Error response: ${text}`);
          });
        } else if (status === 201) {
          console.log('✅ Category created successfully!');
        }
        
        categoryRequests.push({
          method: response.request().method(),
          url: response.url(),
          status: status
        });
      }
    });
    
    // Login
    console.log('1️⃣ Logging in...');
    await page.goto('http://localhost:3000/login');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) adminButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Navigate to category creation
    console.log('2️⃣ Navigating to category creation...');
    await page.goto('http://localhost:3000/products/categories/new');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Fill form
    console.log('3️⃣ Filling form...');
    const categoryName = `Fixed Test ${Date.now()}`;
    
    await page.waitForSelector('input[id="category-name"]');
    await page.click('input[id="category-name"]', { clickCount: 3 });
    await page.type('input[id="category-name"]', categoryName);
    
    console.log(`   Category name: ${categoryName}`);
    
    // Wait for categories to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Submit form
    console.log('4️⃣ Submitting form...');
    const submitButton = await page.$('button[type="submit"]');
    
    if (submitButton) {
      await submitButton.click();
      
      // Wait for submission to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check final URL
      const currentUrl = page.url();
      console.log(`📍 Final URL: ${currentUrl}`);
      
      // Check for success
      const createRequest = categoryRequests.find(req => req.method === 'POST' && req.url.includes('/categories/'));
      
      if (createRequest) {
        if (createRequest.status === 201) {
          console.log('🎉 SUCCESS: Category creation fixed!');
          
          if (currentUrl.includes('/products/categories') && !currentUrl.includes('/new')) {
            console.log('✅ Properly redirected to categories list');
          }
        } else {
          console.log(`❌ FAILED: Got status ${createRequest.status}`);
        }
      } else {
        console.log('⚠️ No category creation request detected');
      }
      
      // Check for notifications
      const notifications = await page.evaluate(() => {
        const alerts = document.querySelectorAll('[role="alert"]');
        return Array.from(alerts).map(alert => alert.textContent?.trim());
      });
      
      if (notifications.length > 0) {
        console.log('📢 Notifications:');
        notifications.forEach(notif => console.log(`   - ${notif}`));
      }
      
    } else {
      console.log('❌ Submit button not found');
    }
    
    console.log('\n📊 Summary:');
    console.log(`Total category API calls: ${categoryRequests.length}`);
    categoryRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url} → ${req.status}`);
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    console.log('\n🎬 Verification complete.');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

verifyFix().catch(console.error);