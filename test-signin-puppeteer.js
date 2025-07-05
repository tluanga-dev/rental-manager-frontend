const puppeteer = require('puppeteer');

async function testSignin() {
    console.log('🚀 Starting frontend signin test with Puppeteer...');
    
    const browser = await puppeteer.launch({
        headless: false, // Set to true for headless mode
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Navigate to the frontend
        console.log('📍 Navigating to frontend...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        // Take screenshot of initial page
        await page.screenshot({ path: 'test-screenshots/01-initial-page.png' });
        console.log('📸 Screenshot saved: 01-initial-page.png');
        
        // Check if we're redirected to login or if login link exists
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        let loginPageUrl;
        if (currentUrl.includes('/login')) {
            console.log('✅ Already on login page');
            loginPageUrl = currentUrl;
        } else {
            // Look for login button/link
            console.log('🔍 Looking for login button/link...');
            const loginLink = await page.$('a[href*="login"], button:contains("Login"), a:contains("Login"), a:contains("Sign In")');
            
            if (loginLink) {
                console.log('🖱️ Clicking login link...');
                await loginLink.click();
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
                loginPageUrl = page.url();
                console.log(`📍 Navigated to: ${loginPageUrl}`);
            } else {
                // Try direct navigation to login
                console.log('🔗 Navigating directly to /login...');
                await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
                loginPageUrl = page.url();
            }
        }
        
        // Take screenshot of login page
        await page.screenshot({ path: 'test-screenshots/02-login-page.png' });
        console.log('📸 Screenshot saved: 02-login-page.png');
        
        // Look for email and password fields
        console.log('🔍 Looking for login form fields...');
        
        const emailSelector = await page.evaluate(() => {
            const selectors = [
                'input[type="email"]',
                'input[name="email"]',
                'input[placeholder*="email" i]',
                'input[id*="email" i]',
                '#email',
                '[data-testid="email"]'
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) return selector;
            }
            return null;
        });
        
        const passwordSelector = await page.evaluate(() => {
            const selectors = [
                'input[type="password"]',
                'input[name="password"]',
                'input[placeholder*="password" i]',
                'input[id*="password" i]',
                '#password',
                '[data-testid="password"]'
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) return selector;
            }
            return null;
        });
        
        console.log(`📧 Email field selector: ${emailSelector}`);
        console.log(`🔒 Password field selector: ${passwordSelector}`);
        
        if (!emailSelector || !passwordSelector) {
            console.log('❌ Could not find email or password fields');
            console.log('📋 Available form inputs:');
            const inputs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('input')).map(input => ({
                    type: input.type,
                    name: input.name,
                    id: input.id,
                    placeholder: input.placeholder,
                    className: input.className
                }));
            });
            console.log(inputs);
            return;
        }
        
        // Fill in the login form
        console.log('✍️ Filling login form...');
        await page.focus(emailSelector);
        await page.type(emailSelector, 'admin@rental.com', { delay: 100 });
        
        await page.focus(passwordSelector);
        await page.type(passwordSelector, 'admin123', { delay: 100 });
        
        // Take screenshot after filling form
        await page.screenshot({ path: 'test-screenshots/03-form-filled.png' });
        console.log('📸 Screenshot saved: 03-form-filled.png');
        
        // Look for submit button
        const submitSelector = await page.evaluate(() => {
            const selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Login")',
                'button:contains("Sign In")',
                'button:contains("Sign in")',
                '[data-testid="submit"]',
                'form button'
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) return selector;
            }
            return null;
        });
        
        console.log(`🚀 Submit button selector: ${submitSelector}`);
        
        if (!submitSelector) {
            console.log('❌ Could not find submit button');
            console.log('📋 Available buttons:');
            const buttons = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('button')).map(button => ({
                    type: button.type,
                    textContent: button.textContent?.trim(),
                    className: button.className,
                    id: button.id
                }));
            });
            console.log(buttons);
            return;
        }
        
        // Set up network monitoring for login request
        console.log('🌐 Monitoring network requests...');
        page.on('response', response => {
            if (response.url().includes('/auth/login')) {
                console.log(`🔔 Login API Response: ${response.status()} ${response.statusText()}`);
            }
        });
        
        page.on('requestfailed', request => {
            console.log(`❌ Request failed: ${request.url()} - ${request.failure()?.errorText}`);
        });
        
        // Submit the form
        console.log('🚀 Submitting login form...');
        await page.click(submitSelector);
        
        // Wait a moment for the request to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Take screenshot after submission
        await page.screenshot({ path: 'test-screenshots/04-after-submit.png' });
        console.log('📸 Screenshot saved: 04-after-submit.png');
        
        // Check final URL and page state
        const finalUrl = page.url();
        console.log(`📍 Final URL: ${finalUrl}`);
        
        // Check for success indicators
        const isLoggedIn = await page.evaluate(() => {
            // Look for common success indicators
            const indicators = [
                document.querySelector('[data-testid="user-menu"]'),
                document.querySelector('.user-profile'),
                document.querySelector('[data-testid="logout"]'),
                document.body.textContent?.includes('Dashboard'),
                document.body.textContent?.includes('Welcome'),
                localStorage.getItem('accessToken'),
                localStorage.getItem('user')
            ];
            
            return indicators.some(indicator => indicator);
        });
        
        // Check for error messages
        const errorMessage = await page.evaluate(() => {
            const errorSelectors = [
                '.error',
                '.alert-error',
                '.text-red-500',
                '[data-testid="error"]',
                '.notification.error'
            ];
            
            for (const selector of errorSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent?.trim()) {
                    return element.textContent.trim();
                }
            }
            return null;
        });
        
        // Check localStorage for tokens
        const tokens = await page.evaluate(() => {
            return {
                accessToken: localStorage.getItem('accessToken'),
                refreshToken: localStorage.getItem('refreshToken'),
                user: localStorage.getItem('user')
            };
        });
        
        console.log('\n📊 TEST RESULTS:');
        console.log('================');
        console.log(`✅ Login form found: ${emailSelector && passwordSelector ? 'YES' : 'NO'}`);
        console.log(`✅ Form submitted: YES`);
        console.log(`✅ Final URL: ${finalUrl}`);
        console.log(`✅ Appears logged in: ${isLoggedIn ? 'YES' : 'NO'}`);
        console.log(`❌ Error message: ${errorMessage || 'None'}`);
        console.log(`🔑 Access token: ${tokens.accessToken ? 'Present' : 'Missing'}`);
        console.log(`🔑 Refresh token: ${tokens.refreshToken ? 'Present' : 'Missing'}`);
        console.log(`👤 User data: ${tokens.user ? 'Present' : 'Missing'}`);
        
        if (isLoggedIn) {
            console.log('\n🎉 LOGIN TEST PASSED!');
        } else {
            console.log('\n❌ LOGIN TEST FAILED!');
            if (errorMessage) {
                console.log(`Error: ${errorMessage}`);
            }
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
testSignin().catch(console.error);