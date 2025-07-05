const puppeteer = require('puppeteer');

async function testDemoAdminButton() {
    console.log('🚀 Testing Demo as Administrator button...');
    
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Navigate to the login page
        console.log('📍 Navigating to login page...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
        
        // Take screenshot of login page
        await page.screenshot({ path: 'test-screenshots/demo-01-login-page.png' });
        console.log('📸 Screenshot saved: demo-01-login-page.png');
        
        // Set up network monitoring
        page.on('response', response => {
            if (response.url().includes('/auth/login')) {
                console.log(`🔔 Login API Response: ${response.status()} ${response.statusText()}`);
            }
        });
        
        page.on('requestfailed', request => {
            console.log(`❌ Request failed: ${request.url()} - ${request.failure()?.errorText}`);
        });
        
        // Look for the "Demo as Administrator" button
        console.log('🔍 Looking for Demo as Administrator button...');
        
        let demoAdminButton;
        try {
            // Wait for any button to appear first
            await page.waitForSelector('button', { timeout: 5000 });
            
            // Find the demo admin button by text content
            demoAdminButton = await page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.find(button => button.textContent?.includes('Demo as Administrator'));
            });
        
        } catch (e) {
            console.log('❌ Error finding demo admin button:', e.message);
        }
        
        // Get all buttons on the page to see what's available
        const buttons = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('button')).map(button => ({
                textContent: button.textContent?.trim(),
                disabled: button.disabled,
                className: button.className,
                id: button.id
            }));
        });
        
        console.log('📋 Available buttons:', buttons);
        
        // Check if demo admin button was found and click it
        const buttonFound = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const adminButton = buttons.find(button => 
                button.textContent?.includes('Demo as Administrator')
            );
            return !!adminButton;
        });
        
        console.log(`🎯 Demo admin button found: ${buttonFound}`);
        
        if (buttonFound) {
            console.log('🖱️ Clicking Demo as Administrator button...');
            
            // Click the button using evaluate to ensure it works
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const adminButton = buttons.find(button => 
                    button.textContent?.includes('Demo as Administrator')
                );
                if (adminButton) {
                    console.log('Clicking demo admin button:', adminButton.textContent);
                    adminButton.click();
                }
            });
            
            // Wait for navigation or response
            console.log('⏳ Waiting for authentication response...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Take screenshot after clicking
            await page.screenshot({ path: 'test-screenshots/demo-02-after-click.png' });
            console.log('📸 Screenshot saved: demo-02-after-click.png');
            
            // Check final URL and state
            const finalUrl = page.url();
            console.log(`📍 Final URL: ${finalUrl}`);
            
            // Check for success indicators
            const isLoggedIn = await page.evaluate(() => {
                return !!(
                    localStorage.getItem('accessToken') ||
                    document.body.textContent?.includes('Dashboard') ||
                    document.querySelector('[data-testid="user-menu"]')
                );
            });
            
            // Check localStorage for tokens
            const tokens = await page.evaluate(() => {
                return {
                    accessToken: !!localStorage.getItem('accessToken'),
                    refreshToken: !!localStorage.getItem('refreshToken'),
                    user: localStorage.getItem('user')
                };
            });
            
            console.log('\n📊 DEMO ADMIN BUTTON TEST RESULTS:');
            console.log('=====================================');
            console.log(`✅ Demo button found: ${buttonFound}`);
            console.log(`✅ Button clicked: YES`);
            console.log(`✅ Final URL: ${finalUrl}`);
            console.log(`✅ Appears logged in: ${isLoggedIn ? 'YES' : 'NO'}`);
            console.log(`🔑 Access token: ${tokens.accessToken ? 'Present' : 'Missing'}`);
            console.log(`🔑 Refresh token: ${tokens.refreshToken ? 'Present' : 'Missing'}`);
            console.log(`👤 User data: ${tokens.user ? 'Present' : 'Missing'}`);
            
            if (isLoggedIn) {
                console.log('\n🎉 DEMO ADMIN BUTTON TEST PASSED!');
            } else {
                console.log('\n❌ DEMO ADMIN BUTTON TEST FAILED!');
            }
            
        } else {
            console.log('❌ Could not find Demo as Administrator button');
            console.log('Available buttons:', buttons.map(b => b.textContent).filter(Boolean));
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    } finally {
        await browser.close();
    }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots');
}

// Run the test
testDemoAdminButton().catch(console.error);