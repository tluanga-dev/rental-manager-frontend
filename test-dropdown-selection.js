const puppeteer = require('puppeteer');

async function testDropdownSelection() {
  console.log('🎯 Test Dropdown Selection\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Track console for debugging
    page.on('console', msg => {
      if (msg.text().includes('📊') || msg.text().includes('📂')) {
        console.log(`🟡 ${msg.text()}`);
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
    
    // Step 2: Navigate to category page
    console.log('2️⃣ Navigate to category page...');
    await page.goto('http://localhost:3000/products/categories/new');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Test dropdown selection
    console.log('3️⃣ Test dropdown selection...');
    
    // Check initial state
    const initialState = await page.evaluate(() => {
      const combobox = document.querySelector('[role="combobox"]');
      return combobox ? combobox.textContent.trim() : 'Not found';
    });
    
    console.log(`   Initial selection: "${initialState}"`);
    
    // Open dropdown
    const combobox = await page.$('[role="combobox"]');
    if (combobox) {
      await combobox.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find and click Electronics option
      const electronicsSelected = await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('[role="option"]'));
        const electronicsOption = options.find(opt => opt.textContent?.includes('Electronics'));
        
        if (electronicsOption) {
          electronicsOption.click();
          return true;
        }
        return false;
      });
      
      console.log(`   Electronics option clicked: ${electronicsSelected}`);
      
      if (electronicsSelected) {
        // Wait for selection to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check new state
        const newState = await page.evaluate(() => {
          const combobox = document.querySelector('[role="combobox"]');
          return combobox ? combobox.textContent.trim() : 'Not found';
        });
        
        console.log(`   New selection: "${newState}"`);
        
        if (newState.includes('Electronics')) {
          console.log('✅ SUCCESS: Dropdown selection is working!');
        } else {
          console.log('❌ FAILED: Selection did not update');
        }
      } else {
        console.log('❌ Could not find Electronics option to click');
      }
      
    } else {
      console.log('❌ Could not find combobox');
    }
    
    // Step 4: Test category creation with selected parent
    console.log('4️⃣ Test category creation...');
    
    const categoryName = `Test Child Category ${Date.now()}`;
    
    // Fill category name
    await page.click('input[id="category-name"]', { clickCount: 3 });
    await page.type('input[id="category-name"]', categoryName);
    
    console.log(`   Category name: ${categoryName}`);
    
    // Submit
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      console.log('   🚀 Form submitted');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const currentUrl = page.url();
      if (currentUrl.includes('/products/categories') && !currentUrl.includes('/new')) {
        console.log('🎉 SUCCESS: Category created and redirected!');
      } else {
        console.log(`⚠️ Current URL: ${currentUrl}`);
      }
    }
    
    console.log('\n🎬 Test complete!');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDropdownSelection().catch(console.error);