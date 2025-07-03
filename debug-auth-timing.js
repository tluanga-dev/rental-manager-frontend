const puppeteer = require('puppeteer');

async function debugAuthTiming() {
  console.log('⏱️ Auth Timing Debug Test\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Track auth state changes in console
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('auth') || text.includes('loading') || text.includes('hydration')) {
        console.log(`🟡 Console: ${text}`);
      }
    });
    
    // Step 1: Login
    console.log('1️⃣ Login process...');
    await page.goto('http://localhost:3000/login');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) adminButton.click();
    });
    
    // Wait for redirect and check auth state
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const authAfterLogin = await page.evaluate(() => {
      const authData = localStorage.getItem('auth-storage');
      return {
        url: window.location.href,
        authExists: !!authData,
        authData: authData ? JSON.parse(authData) : null
      };
    });
    
    console.log('   Auth after login:', JSON.stringify(authAfterLogin, null, 2));
    
    // Step 2: Navigate to category page and track timing
    console.log('2️⃣ Navigate to category page...');
    
    const startTime = Date.now();
    await page.goto('http://localhost:3000/products/categories/new');
    
    // Check page state every 500ms for 10 seconds
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const elapsed = Date.now() - startTime;
      const pageState = await page.evaluate(() => {
        return {
          url: window.location.href,
          hasForm: !!document.querySelector('form'),
          hasCategoryInput: !!document.querySelector('input[id="category-name"]'),
          hasLoginButton: document.body.textContent.includes('Demo as Administrator') ||
                         document.body.textContent.includes('Login'),
          bodySnippet: document.body.textContent.substring(0, 150).replace(/\s+/g, ' ').trim()
        };
      });
      
      console.log(`   ${elapsed}ms: URL=${pageState.url.split('/').pop()}, Form=${pageState.hasForm}, Input=${pageState.hasCategoryInput}, LoginContent=${pageState.hasLoginButton}`);
      
      if (pageState.hasCategoryInput) {
        console.log('✅ Category form found!');
        break;
      }
      
      if (pageState.hasLoginButton && elapsed > 2000) {
        console.log('❌ Still showing login content after 2s');
        console.log(`   Body snippet: ${pageState.bodySnippet}`);
        break;
      }
    }
    
    // Final check
    const finalState = await page.evaluate(() => {
      const authData = localStorage.getItem('auth-storage');
      return {
        url: window.location.href,
        authData: authData ? JSON.parse(authData) : null,
        hasForm: !!document.querySelector('form'),
        hasCategoryInput: !!document.querySelector('input[id="category-name"]'),
        allInputs: Array.from(document.querySelectorAll('input')).map(inp => ({
          id: inp.id,
          type: inp.type,
          placeholder: inp.placeholder
        }))
      };
    });
    
    console.log('\n3️⃣ Final state:', JSON.stringify(finalState, null, 2));
    
    if (finalState.hasCategoryInput) {
      console.log('🎉 SUCCESS: Category form is accessible');
    } else {
      console.log('❌ FAILED: Category form not accessible');
      
      // Take screenshot for debugging
      await page.screenshot({ path: './screenshots/auth-timing-debug.png', fullPage: true });
      console.log('📸 Screenshot saved: ./screenshots/auth-timing-debug.png');
    }
    
    console.log('\n🎬 Keeping browser open for inspection...');
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

debugAuthTiming().catch(console.error);