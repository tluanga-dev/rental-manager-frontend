const puppeteer = require('puppeteer');

async function debugDropdown() {
  console.log('📋 Debug Category Dropdown\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Track console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('categories') || text.includes('loading') || text.includes('Error')) {
        console.log(`🟡 Console: ${text}`);
      }
    });
    
    // Track network requests
    page.on('response', response => {
      if (response.url().includes('/categories')) {
        console.log(`📡 ${response.status()} ${response.url()}`);
        
        response.text().then(text => {
          if (response.status() === 200) {
            try {
              const data = JSON.parse(text);
              console.log(`   📊 Categories count: ${data.items ? data.items.length : 'Unknown structure'}`);
              if (data.items && data.items.length > 0) {
                console.log(`   📋 First category: ${data.items[0].category_name}`);
              }
            } catch (e) {
              console.log(`   ⚠️ Could not parse response: ${text.substring(0, 100)}...`);
            }
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
    
    // Step 2: Navigate and wait for form
    console.log('2️⃣ Navigate to category page...');
    await page.goto('http://localhost:3000/products/categories/new');
    
    // Wait for form to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Check dropdown state
    console.log('3️⃣ Check dropdown state...');
    
    const dropdownInfo = await page.evaluate(() => {
      const combobox = document.querySelector('[role="combobox"]');
      
      if (!combobox) {
        return { error: 'Combobox not found' };
      }
      
      return {
        text: combobox.textContent?.trim(),
        placeholder: combobox.getAttribute('placeholder'),
        disabled: combobox.hasAttribute('disabled') || combobox.hasAttribute('aria-disabled'),
        ariaExpanded: combobox.getAttribute('aria-expanded'),
        className: combobox.className
      };
    });
    
    console.log('   Dropdown info:', JSON.stringify(dropdownInfo, null, 2));
    
    // Step 4: Try to open dropdown
    console.log('4️⃣ Try to open dropdown...');
    
    const combobox = await page.$('[role="combobox"]');
    if (combobox) {
      await combobox.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for options
      const options = await page.evaluate(() => {
        const opts = Array.from(document.querySelectorAll('[role="option"]'));
        return opts.map(opt => ({
          text: opt.textContent?.trim(),
          value: opt.getAttribute('data-value') || opt.getAttribute('value') || opt.dataset.value,
          ariaSelected: opt.getAttribute('aria-selected'),
          allAttributes: Array.from(opt.attributes).map(attr => `${attr.name}="${attr.value}"`),
          innerHTML: opt.innerHTML.substring(0, 100)
        }));
      });
      
      console.log(`   📋 Found ${options.length} options:`);
      options.forEach((opt, i) => {
        console.log(`      ${i + 1}. "${opt.text}" (value: ${opt.value})`);
      });
      
      if (options.length === 0) {
        console.log('❌ No options found in dropdown');
        
        // Check for loading or error states
        const dropdownState = await page.evaluate(() => {
          return {
            loadingText: document.body.textContent.includes('Loading categories'),
            noDataText: document.body.textContent.includes('No categories found'),
            rootCategoryVisible: document.body.textContent.includes('Root Category'),
            bodyContainsCategories: document.body.textContent.includes('categories')
          };
        });
        
        console.log('   Dropdown state:', JSON.stringify(dropdownState, null, 2));
      }
      
    } else {
      console.log('❌ Could not find combobox element');
    }
    
    // Step 5: Check React state (if possible)
    console.log('5️⃣ Check page state...');
    
    const pageState = await page.evaluate(() => {
      // Try to get React component state (this might not work depending on build)
      const reactFiber = document.querySelector('#__next')?._reactInternalFiber || 
                        document.querySelector('#__next')?._reactInternalInstance;
      
      return {
        hasReactFiber: !!reactFiber,
        formElements: {
          categoryNameInput: !!document.querySelector('input[id="category-name"]'),
          combobox: !!document.querySelector('[role="combobox"]'),
          submitButton: !!document.querySelector('button[type="submit"]')
        },
        loadingIndicators: Array.from(document.querySelectorAll('*')).some(el => 
          el.textContent?.includes('Loading') || el.classList.contains('animate-pulse')
        )
      };
    });
    
    console.log('   Page state:', JSON.stringify(pageState, null, 2));
    
    console.log('\n🎬 Debug complete. Browser will stay open...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugDropdown().catch(console.error);