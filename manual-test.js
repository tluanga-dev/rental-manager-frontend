const puppeteer = require('puppeteer');

async function manualTest() {
  console.log('🧪 Manual Category Creation Test');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Simple console monitoring
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('payload') || text.includes('error') || text.includes('Error')) {
        console.log(`🔍 CONSOLE: ${text}`);
      }
    });
    
    // Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3000/login');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => btn.textContent.includes('Demo as Administrator'));
      if (adminButton) adminButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Go to category page
    console.log('2. Going to category creation...');
    await page.goto('http://localhost:3000/products/categories/new');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('3. Page loaded. You can now manually test in the browser.');
    console.log('   - Fill in the category name');
    console.log('   - Select parent category');
    console.log('   - Click submit');
    console.log('   - Check console for detailed error info');
    console.log('');
    console.log('Browser will stay open for 2 minutes for manual testing...');
    
    // Keep browser open for manual testing
    await new Promise(resolve => setTimeout(resolve, 120000));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

manualTest().catch(console.error);