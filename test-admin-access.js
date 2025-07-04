const puppeteer = require('puppeteer');
const fs = require('fs');

async function testAdminAccess() {
  console.log('Starting admin access test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    
    // Login with admin credentials
    console.log('Logging in as admin...');
    await page.type('input[name="email"]', 'admin@rental.com');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Successfully logged in');
    
    // Wait for sidebar to be visible
    await page.waitForSelector('nav', { visible: true });
    
    // Take screenshot
    await page.screenshot({ path: 'admin-sidebar-test.png', fullPage: true });
    console.log('Screenshot taken');
    
    // Expand all collapsible menu items
    console.log('Expanding all menu items...');
    await page.evaluate(() => {
      // Find all buttons that might expand submenus
      const buttons = Array.from(document.querySelectorAll('button'));
      const expandButtons = buttons.filter(btn => {
        const text = btn.textContent?.trim();
        return text && (
          text.includes('Products') || 
          text.includes('Customers') || 
          text.includes('Inventory') || 
          text.includes('Sales') || 
          text.includes('Rentals') || 
          text.includes('Purchases') ||
          text.includes('Returns')
        );
      });
      
      expandButtons.forEach(btn => {
        try {
          btn.click();
        } catch (e) {
          // Ignore click errors
        }
      });
    });
    
    // Wait for expansions to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all visible menu items in the sidebar
    const visibleMenuItems = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return [];
      
      const getVisibleItems = (element, path = '') => {
        let items = [];
        const children = Array.from(element.children);
        
        for (const child of children) {
          // Look for text content that appears to be menu items
          const links = child.querySelectorAll('a, button');
          for (const link of links) {
            const text = link.textContent?.trim();
            if (text && text.length > 0 && text.length < 50 && 
                !text.includes('Rental Manager') && 
                !text.includes('Logout') &&
                !text.includes('undefined')) {
              
              // Check if the element is visible
              const rect = link.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                const href = link.getAttribute('href') || '';
                items.push({
                  text: text,
                  href: href,
                  isVisible: true
                });
              }
            }
          }
          
          // Recursively check children
          if (child.children.length > 0) {
            items.push(...getVisibleItems(child, path + '/' + child.tagName));
          }
        }
        
        return items;
      };
      
      return getVisibleItems(nav);
    });
    
    console.log('\nVisible menu items:');
    const uniqueItems = [...new Map(visibleMenuItems.map(item => [item.text, item])).values()];
    uniqueItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.text} (${item.href})`);
    });
    
    // Expected menu items for admin
    const expectedMenuItems = [
      'Dashboard',
      'Customers', 'All Customers', 'Add Customer', 'Analytics',
      'Products', 'Categories', 'Brands', 'Products', 'SKUs',
      'Inventory', 'Stock Levels', 'Locations',
      'Sales', 'New Sale', 'Sales History',
      'Rentals', 'New Rental', 'Active Rentals', 'Rental History', 'Returns',
      'Process Returns', 'Return Queue', 'Return Analytics',
      'Purchases', 'Suppliers', 'Supplier Analytics', 'Receive Inventory',
      'Inspections', 'Reports', 'Settings'
    ];
    
    // Check which expected items are missing
    const foundItems = uniqueItems.map(item => item.text);
    const missingItems = expectedMenuItems.filter(expected => 
      !foundItems.some(found => found.includes(expected) || expected.includes(found))
    );
    
    console.log(`\nFound ${uniqueItems.length} unique menu items`);
    
    if (missingItems.length > 0) {
      console.log('\nMissing expected items:');
      missingItems.forEach(item => console.log(`- ${item}`));
    } else {
      console.log('\n✅ All expected menu items are visible to admin');
    }
    
    // Test clicking on a few menu items to ensure they're accessible
    const testItems = ['Dashboard', 'Customers', 'Products', 'Rentals'];
    console.log('\nTesting menu item navigation...');
    
    for (const testItem of testItems) {
      try {
        const itemFound = await page.evaluate((itemText) => {
          const links = Array.from(document.querySelectorAll('a, button'));
          const link = links.find(l => l.textContent?.trim() === itemText);
          if (link) {
            link.click();
            return true;
          }
          return false;
        }, testItem);
        
        if (itemFound) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for navigation
          console.log(`✅ Successfully clicked ${testItem}`);
        } else {
          console.log(`❌ Could not find ${testItem} to click`);
        }
      } catch (error) {
        console.log(`❌ Error clicking ${testItem}: ${error.message}`);
      }
    }
    
    // Final screenshot after testing
    await page.screenshot({ path: 'admin-sidebar-test-final.png', fullPage: true });
    
    // Summary
    const testResults = {
      timestamp: new Date().toISOString(),
      totalMenuItems: uniqueItems.length,
      expectedItems: expectedMenuItems.length,
      missingItems: missingItems,
      visibleMenuItems: uniqueItems,
      success: missingItems.length === 0
    };
    
    fs.writeFileSync('admin-access-test-results.json', JSON.stringify(testResults, null, 2));
    console.log('\nTest results saved to admin-access-test-results.json');
    
    console.log(`\n=== ADMIN ACCESS TEST RESULTS ===`);
    console.log(`Test ${testResults.success ? 'PASSED' : 'FAILED'}`);
    console.log(`Visible menu items: ${testResults.totalMenuItems}`);
    console.log(`Missing items: ${missingItems.length}`);
    
    return testResults.success;
    
  } catch (error) {
    console.error('Test failed with error:', error);
    await page.screenshot({ path: 'admin-access-test-error.png', fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testAdminAccess()
  .then(success => {
    console.log(`\nTest completed. Success: ${success}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });