const puppeteer = require('puppeteer');

async function debugOptions() {
  console.log('🔍 Debug Category Options Data\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Track all console messages including debugging
    page.on('console', msg => {
      console.log(`🔵 Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Track API responses
    page.on('response', response => {
      if (response.url().includes('/categories')) {
        console.log(`📡 ${response.status()} ${response.url()}`);
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
    
    // Step 2: Navigate and inject debugging
    console.log('2️⃣ Navigate and inject debugging...');
    await page.goto('http://localhost:3000/products/categories/new');
    
    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Inject debugging into the page
    await page.evaluate(() => {
      // Override console.log to make our debugging visible
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog('[DEBUG]', ...args);
      };
      
      // Add debugging to the page
      console.log('🔍 Starting page debugging...');
      
      // Try to access React component props/state
      const combobox = document.querySelector('[role="combobox"]');
      if (combobox) {
        console.log('📋 Combobox found, checking React props...');
        
        // Try to find React fiber
        const reactKeys = Object.keys(combobox).filter(key => key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber'));
        console.log('React keys found:', reactKeys);
        
        // Look for data in surrounding elements
        const form = combobox.closest('form');
        if (form) {
          console.log('📝 Form found, looking for data attributes...');
          const dataAttrs = Array.from(form.attributes).filter(attr => attr.name.startsWith('data-'));
          console.log('Data attributes:', dataAttrs.map(attr => `${attr.name}=${attr.value}`));
        }
      }
      
      // Check for any React dev tools
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('🔧 React DevTools detected');
      }
      
      // Check localStorage for any relevant data
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        console.log('🔐 Auth data exists in localStorage');
      }
      
      // Look for any global variables that might contain category data
      const globalProps = Object.keys(window).filter(key => key.includes('categories') || key.includes('Category'));
      console.log('Global category-related props:', globalProps);
    });
    
    // Wait for debugging output
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Test opening dropdown and check DOM state
    console.log('3️⃣ Test dropdown DOM state...');
    
    const combobox = await page.$('[role="combobox"]');
    if (combobox) {
      // Click to open
      await combobox.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check the popover content
      const popoverState = await page.evaluate(() => {
        const popover = document.querySelector('[role="dialog"]') || 
                       document.querySelector('.popover') ||
                       document.querySelector('[data-radix-popper-content-wrapper]');
        
        if (!popover) {
          return { error: 'No popover found' };
        }
        
        return {
          visible: popover.style.display !== 'none' && popover.offsetParent !== null,
          innerHTML: popover.innerHTML.substring(0, 500),
          children: Array.from(popover.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            textContent: child.textContent?.substring(0, 100)
          })),
          optionCount: popover.querySelectorAll('[role="option"]').length,
          hasSearch: !!popover.querySelector('input[placeholder*="Search"]'),
          hasEmptyMessage: popover.textContent?.includes('No option found') || popover.textContent?.includes('No categories found')
        };
      });
      
      console.log('   Popover state:', JSON.stringify(popoverState, null, 2));
      
      // Take a screenshot for visual debugging
      await page.screenshot({ path: './screenshots/dropdown-debug.png', fullPage: true });
      console.log('📸 Screenshot saved: ./screenshots/dropdown-debug.png');
      
    } else {
      console.log('❌ Combobox not found');
    }
    
    console.log('\n🎬 Debug complete. Browser will stay open...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Ensure screenshots directory exists
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

debugOptions().catch(console.error);