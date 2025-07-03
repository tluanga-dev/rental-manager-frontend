const puppeteer = require('puppeteer');

async function testCategoryCreation() {
  console.log('🧪 Simple Category Creation Test\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Track network requests
    page.on('request', request => {
      if (request.url().includes('/categories')) {
        console.log(`📤 ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`   Body: ${request.postData()}`);
        }
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/categories')) {
        console.log(`📥 ${response.status()} ${response.url()}`);
        
        response.text().then(text => {
          if (response.status() >= 400) {
            console.log(`❌ Error: ${text}`);
          } else {
            console.log(`✅ Success: ${text.substring(0, 100)}...`);
          }
        }).catch(() => {});
      }
    });
    
    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('error')) {
        console.log(`🔴 Console: ${msg.text()}`);
      }
    });
    
    // Step 1: Login
    console.log('1. Login...');
    await page.goto('http://localhost:3000/login');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) adminButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Go to category page
    console.log('2. Navigate to category page...');
    await page.goto('http://localhost:3000/products/categories/new');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 3: Check page content
    const pageCheck = await page.evaluate(() => {
      return {
        title: document.title,
        hasForm: !!document.querySelector('form'),
        hasNameInput: !!document.querySelector('input[id="category-name"]'),
        hasCombobox: !!document.querySelector('[role="combobox"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
        bodyText: document.body.textContent.substring(0, 200)
      };
    });
    
    console.log('3. Page check:', JSON.stringify(pageCheck, null, 2));
    
    if (pageCheck.hasNameInput) {
      // Step 4: Fill form
      console.log('4. Fill form...');
      
      const testName = `Test ${Date.now()}`;
      await page.click('input[id="category-name"]', { clickCount: 3 });
      await page.type('input[id="category-name"]', testName);
      
      console.log(`   Typed: ${testName}`);
      
      // Wait and check dropdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 5: Submit
      console.log('5. Submit form...');
      
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        
        // Wait for response
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('   Form submitted, check results above');
      } else {
        console.log('   No submit button found');
      }
    } else {
      console.log('❌ Form not found on page');
      
      // Take screenshot for debugging
      await page.screenshot({ path: './screenshots/page-error.png', fullPage: true });
    }
    
    console.log('\n🎬 Test complete. Browser will stay open for inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Ensure screenshots directory exists
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

testCategoryCreation().catch(console.error);