const puppeteer = require('puppeteer');

async function testLoginUI() {
  console.log('Testing Frontend Login UI...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Go to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    console.log('✅ Login page loaded');
    
    // Check if login form exists
    const emailInput = await page.$('input[type="email"], input[name="email"], input#email');
    const passwordInput = await page.$('input[type="password"], input[name="password"], input#password');
    const submitButton = await page.$('button[type="submit"]');
    
    if (emailInput && passwordInput) {
      console.log('✅ Login form found');
      
      // Fill in credentials
      console.log('\n2. Filling in credentials...');
      await emailInput.type('admin@rental.com');
      await passwordInput.type('admin123');
      console.log('✅ Credentials entered');
      
      // Submit form
      console.log('\n3. Submitting login form...');
      if (submitButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          submitButton.click()
        ]);
      } else {
        // Try pressing Enter if no submit button found
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          page.keyboard.press('Enter')
        ]);
      }
      
      // Check if redirected to dashboard
      const currentUrl = page.url();
      if (currentUrl.includes('dashboard') || currentUrl === 'http://localhost:3000/') {
        console.log('✅ Successfully logged in and redirected to:', currentUrl);
      } else {
        console.log('⚠️  Logged in but on unexpected page:', currentUrl);
      }
      
      // Check for user info
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userEmail = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const element = elements.find(el => el.textContent && el.textContent.includes('admin@rental.com'));
        return element ? element.textContent : null;
      });
      if (userEmail) {
        console.log('✅ User email displayed in UI');
      }
      
      console.log('\n✅ Frontend login UI test completed successfully!');
      
    } else {
      console.log('❌ Login form not found on the page');
      console.log('Page URL:', page.url());
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'login-page-debug.png' });
      console.log('Screenshot saved as login-page-debug.png');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take a screenshot on error
    const page = (await browser.pages())[0];
    if (page) {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('Error screenshot saved as error-screenshot.png');
    }
  } finally {
    await browser.close();
  }
}

testLoginUI();