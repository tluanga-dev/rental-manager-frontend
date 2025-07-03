const puppeteer = require('puppeteer');

async function debugAuth() {
  console.log('🔐 Authentication Debug Test\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Step 1: Login
    console.log('1️⃣ Going to login page...');
    await page.goto('http://localhost:3000/login');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check login page content
    const loginPageCheck = await page.evaluate(() => {
      return {
        hasAdminButton: !!Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Demo as Administrator')
        ),
        bodyText: document.body.textContent.substring(0, 200)
      };
    });
    
    console.log('   Login page check:', loginPageCheck);
    
    if (!loginPageCheck.hasAdminButton) {
      console.log('❌ Admin button not found on login page');
      return;
    }
    
    // Click admin login
    console.log('2️⃣ Clicking admin login...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) adminButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check localStorage after login
    const authState = await page.evaluate(() => {
      const authData = localStorage.getItem('auth-storage');
      return {
        authStorageExists: !!authData,
        authData: authData ? JSON.parse(authData) : null,
        currentUrl: window.location.href,
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken')
      };
    });
    
    console.log('3️⃣ Auth state after login:', JSON.stringify(authState, null, 2));
    
    // Check if redirected to dashboard
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Still on login page - auth failed');
      return;
    }
    
    // Step 2: Navigate to category page
    console.log('4️⃣ Navigating to category creation...');
    await page.goto('http://localhost:3000/products/categories/new');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if still authenticated
    const categoryPageCheck = await page.evaluate(() => {
      return {
        currentUrl: window.location.href,
        hasForm: !!document.querySelector('form'),
        hasCategoryInput: !!document.querySelector('input[id="category-name"]'),
        hasLoginContent: document.body.textContent.includes('Login') || 
                        document.body.textContent.includes('Sign in'),
        bodyText: document.body.textContent.substring(0, 300)
      };
    });
    
    console.log('5️⃣ Category page check:', JSON.stringify(categoryPageCheck, null, 2));
    
    if (categoryPageCheck.hasLoginContent) {
      console.log('❌ Redirected back to login - auth not persisting');
      
      // Check auth state again
      const authStateAfterNav = await page.evaluate(() => {
        const authData = localStorage.getItem('auth-storage');
        return {
          authStorageExists: !!authData,
          authData: authData ? JSON.parse(authData) : null,
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken')
        };
      });
      
      console.log('   Auth state after navigation:', JSON.stringify(authStateAfterNav, null, 2));
      
    } else if (categoryPageCheck.hasForm) {
      console.log('✅ Successfully authenticated and on category page');
    } else {
      console.log('⚠️ Unknown page state');
    }
    
    console.log('\n🎬 Debug complete. Browser will stay open...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Auth debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugAuth().catch(console.error);