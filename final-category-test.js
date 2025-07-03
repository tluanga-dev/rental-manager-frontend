const puppeteer = require('puppeteer');

async function finalCategoryTest() {
  console.log('🎯 Final Category Creation Test\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Track category API requests
    page.on('request', request => {
      if (request.url().includes('/categories')) {
        console.log(`📤 ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`   📦 Body: ${request.postData()}`);
        }
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/categories')) {
        console.log(`📥 ${response.status()} ${response.url()}`);
        
        response.text().then(text => {
          if (response.status() >= 400) {
            console.log(`❌ Error: ${text}`);
          } else if (response.status() === 201) {
            console.log(`✅ Created: ${text.substring(0, 100)}...`);
          }
        }).catch(() => {});
      }
    });
    
    // Step 1: Login
    console.log('1️⃣ Login...');
    await page.goto('http://localhost:3000/login');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) adminButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Navigate to category creation
    console.log('2️⃣ Navigate to category creation...');
    await page.goto('http://localhost:3000/products/categories/new');
    
    // Wait for the form to appear (up to 5 seconds)
    let formReady = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const hasInput = await page.evaluate(() => {
        return !!document.querySelector('input[id="category-name"]');
      });
      
      if (hasInput) {
        formReady = true;
        break;
      }
      console.log(`   Waiting for form... (${(i + 1) * 500}ms)`);
    }
    
    if (!formReady) {
      console.log('❌ Form did not load in time');
      return;
    }
    
    console.log('   ✅ Form loaded');
    
    // Step 3: Fill form
    console.log('3️⃣ Fill form...');
    const categoryName = `Final Test ${Date.now()}`;
    
    await page.click('input[id="category-name"]', { clickCount: 3 });
    await page.type('input[id="category-name"]', categoryName);
    
    console.log(`   Category name: ${categoryName}`);
    
    // Wait for categories to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if dropdown is working
    const dropdownStatus = await page.evaluate(() => {
      const combobox = document.querySelector('[role="combobox"]');
      return {
        exists: !!combobox,
        text: combobox ? combobox.textContent.trim() : 'Not found'
      };
    });
    
    console.log(`   Dropdown status: ${JSON.stringify(dropdownStatus)}`);
    
    // Step 4: Submit
    console.log('4️⃣ Submit form...');
    
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      console.log('   🚀 Form submitted');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`   📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/products/categories') && !currentUrl.includes('/new')) {
        console.log('🎉 SUCCESS: Redirected to categories list');
      }
      
    } else {
      console.log('❌ Submit button not found');
    }
    
    console.log('\n📊 Test complete!');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

finalCategoryTest().catch(console.error);