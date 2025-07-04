const puppeteer = require('puppeteer');
const fs = require('fs');

async function testSidebarReturns() {
  console.log('Starting Puppeteer test for sidebar returns structure...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Login with demo credentials
    console.log('Logging in...');
    await page.type('input[name="email"]', 'admin@example.com');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Successfully logged in');
    
    // Wait for sidebar to be visible
    await page.waitForSelector('nav', { visible: true });
    
    // Take initial screenshot
    await page.screenshot({ path: 'sidebar-test-initial.png', fullPage: true });
    console.log('Initial screenshot taken');
    
    // Check if Rentals menu item exists
    const rentalsMenu = await page.$('text=Rentals');
    if (!rentalsMenu) {
      console.log('❌ Rentals menu item not found');
      return false;
    }
    console.log('✅ Rentals menu item found');
    
    // Click on Rentals to expand it (if not already expanded)
    await page.evaluate(() => {
      const rentalsButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.includes('Rentals')
      );
      if (rentalsButton) {
        rentalsButton.click();
      }
    });
    
    // Wait a moment for expansion
    await page.waitForTimeout(500);
    
    // Take screenshot after expanding
    await page.screenshot({ path: 'sidebar-test-expanded.png', fullPage: true });
    console.log('Screenshot after expanding Rentals taken');
    
    // Check for Returns submenu under Rentals
    console.log('Checking for Returns submenu...');
    
    // Look for Returns text in the sidebar
    const returnsElements = await page.$$eval('*', elements => 
      elements.filter(el => el.textContent?.trim() === 'Returns')
        .map(el => ({
          text: el.textContent,
          tagName: el.tagName,
          className: el.className,
          parentText: el.parentElement?.textContent
        }))
    );
    
    console.log('Returns elements found:', returnsElements);
    
    // Check for specific return submenu items
    const returnSubmenuItems = [
      'Process Returns',
      'Return Queue', 
      'Return Analytics'
    ];
    
    let foundSubmenuItems = [];
    for (const item of returnSubmenuItems) {
      const found = await page.evaluate((itemText) => {
        return Array.from(document.querySelectorAll('*')).some(
          el => el.textContent?.trim() === itemText
        );
      }, item);
      
      if (found) {
        foundSubmenuItems.push(item);
        console.log(`✅ Found submenu item: ${item}`);
      } else {
        console.log(`❌ Missing submenu item: ${item}`);
      }
    }
    
    // Check sidebar structure
    const sidebarStructure = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return 'No nav element found';
      
      const getMenuStructure = (element, depth = 0) => {
        const indent = '  '.repeat(depth);
        let structure = '';
        
        const children = Array.from(element.children);
        for (const child of children) {
          const text = child.textContent?.trim().split('\n')[0];
          if (text && text.length > 0 && text.length < 50) {
            structure += `${indent}- ${text}\n`;
            if (child.children.length > 0) {
              structure += getMenuStructure(child, depth + 1);
            }
          }
        }
        return structure;
      };
      
      return getMenuStructure(nav);
    });
    
    console.log('\nSidebar structure:');
    console.log(sidebarStructure);
    
    // Final screenshot
    await page.screenshot({ path: 'sidebar-test-final.png', fullPage: true });
    
    // Summary
    const success = foundSubmenuItems.length === returnSubmenuItems.length;
    console.log('\n=== TEST RESULTS ===');
    console.log(`Found ${foundSubmenuItems.length}/${returnSubmenuItems.length} expected return submenu items`);
    console.log(`Test ${success ? 'PASSED' : 'FAILED'}`);
    
    // Save results to file
    const results = {
      timestamp: new Date().toISOString(),
      success,
      foundSubmenuItems,
      missingItems: returnSubmenuItems.filter(item => !foundSubmenuItems.includes(item)),
      sidebarStructure,
      screenshots: [
        'sidebar-test-initial.png',
        'sidebar-test-expanded.png', 
        'sidebar-test-final.png'
      ]
    };
    
    fs.writeFileSync('sidebar-returns-test-results.json', JSON.stringify(results, null, 2));
    console.log('Results saved to sidebar-returns-test-results.json');
    
    return success;
    
  } catch (error) {
    console.error('Test failed with error:', error);
    await page.screenshot({ path: 'sidebar-test-error.png', fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testSidebarReturns()
  .then(success => {
    console.log(`\nTest completed. Success: ${success}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });