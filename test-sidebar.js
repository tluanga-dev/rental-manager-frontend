const puppeteer = require('puppeteer');

async function testSidebar() {
  console.log('🔍 Testing Sidebar Functionality...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,  // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1400, height: 900 });
    
    // Go to the application
    console.log('1. Navigating to application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Check if we're redirected to login
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('2. Login page detected, logging in...');
      
      // Fill login form
      await page.waitForSelector('input[type="email"], input[name="email"]');
      await page.type('input[type="email"], input[name="email"]', 'admin@rental.com');
      await page.type('input[type="password"], input[name="password"]', 'admin123');
      
      // Submit form
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type="submit"]')
      ]);
      
      console.log('   ✅ Login successful');
    }
    
    // Wait for dashboard to load
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);
    
    // Check if sidebar is present
    console.log('3. Checking sidebar presence...');
    const sidebar = await page.$('nav, [role="navigation"], .sidebar');
    
    if (sidebar) {
      console.log('   ✅ Sidebar found');
      
      // Check for sidebar content
      const menuItems = await page.$$eval('nav a, nav button', elements => 
        elements.map(el => el.textContent?.trim()).filter(text => text && text.length > 0)
      );
      
      console.log(`   📋 Found ${menuItems.length} menu items:`);
      menuItems.slice(0, 10).forEach((item, index) => {
        console.log(`      ${index + 1}. ${item}`);
      });
      if (menuItems.length > 10) {
        console.log(`      ... and ${menuItems.length - 10} more`);
      }
      
      // Test sidebar toggle
      console.log('4. Testing sidebar toggle...');
      const toggleButton = await page.$('[data-testid="sidebar-toggle"], button:has-text("menu"), button:has(svg)');
      
      if (toggleButton) {
        await toggleButton.click();
        await page.waitForTimeout(500);
        console.log('   ✅ Sidebar toggle clicked');
        
        // Check if sidebar collapsed
        const sidebarAfterToggle = await page.$eval('nav', el => el.offsetWidth);
        console.log(`   📏 Sidebar width after toggle: ${sidebarAfterToggle}px`);
      } else {
        console.log('   ⚠️  Sidebar toggle button not found');
      }
      
      // Test menu item clicks
      console.log('5. Testing menu navigation...');
      const dashboardLink = await page.$('a[href*="dashboard"], button:has-text("Dashboard")');
      
      if (dashboardLink) {
        await dashboardLink.click();
        await page.waitForTimeout(1000);
        console.log('   ✅ Dashboard link clicked');
      }
      
      // Test submenu expansion
      const customersMenu = await page.$('button:has-text("Customers"), .menu-item:has-text("Customers")');
      if (customersMenu) {
        await customersMenu.click();
        await page.waitForTimeout(500);
        console.log('   ✅ Customers submenu toggled');
      }
      
    } else {
      console.log('   ❌ Sidebar not found');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'sidebar-debug.png', fullPage: true });
      console.log('   📸 Screenshot saved as sidebar-debug.png');
      
      // Check page content
      const pageContent = await page.evaluate(() => document.body.innerText);
      console.log('   📄 Page content preview:', pageContent.substring(0, 200) + '...');
    }
    
    // Check authentication state
    console.log('6. Checking authentication state...');
    const authState = await page.evaluate(() => {
      const authData = localStorage.getItem('auth-storage');
      return authData ? JSON.parse(authData) : null;
    });
    
    if (authState && authState.state) {
      console.log(`   👤 User: ${authState.state.user?.email || 'Unknown'}`);
      console.log(`   🔐 Authenticated: ${authState.state.isAuthenticated}`);
      console.log(`   🛡️  Permissions: ${authState.state.permissions?.length || 0} permissions`);
    }
    
    console.log('\n✅ Sidebar testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    const page = (await browser.pages())[0];
    if (page) {
      await page.screenshot({ path: 'sidebar-error.png' });
      console.log('📸 Error screenshot saved as sidebar-error.png');
    }
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser left open for manual inspection. Close manually when done.');
    // await browser.close();
  }
}

testSidebar();