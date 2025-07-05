const puppeteer = require('puppeteer');

async function testAuthStore() {
    console.log('🔍 Testing auth store permissions...');
    
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Navigate to login page
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
        
        // Login with demo admin button
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const adminButton = buttons.find(button => 
                button.textContent?.includes('Demo as Administrator')
            );
            if (adminButton) adminButton.click();
        });
        
        // Wait for login to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check auth store state
        const authState = await page.evaluate(() => {
            // Access Zustand store from localStorage
            const authStorage = localStorage.getItem('auth-storage');
            const parsedStorage = authStorage ? JSON.parse(authStorage) : null;
            
            return {
                localStorage: {
                    authStorage: parsedStorage,
                    accessToken: localStorage.getItem('accessToken'),
                    refreshToken: localStorage.getItem('refreshToken')
                },
                // Try to access the store directly from window (if exposed)
                storeFromWindow: window.useAuthStore ? window.useAuthStore.getState() : 'not available'
            };
        });
        
        console.log('🔑 Auth Storage:', JSON.stringify(authState, null, 2));
        
        // Check what the hasPermission function returns
        const permissionTest = await page.evaluate(() => {
            // Try to access store state and test permissions
            const authStorage = localStorage.getItem('auth-storage');
            if (!authStorage) return { error: 'No auth storage found' };
            
            const parsedStorage = JSON.parse(authStorage);
            const { user, permissions } = parsedStorage.state || {};
            
            return {
                userIsSuperuser: user?.isSuperuser,
                userType: user?.userType,
                permissionsCount: permissions?.length,
                hasPermissions: permissions?.includes('SALE_VIEW') && permissions?.includes('RENTAL_VIEW'),
                samplePermissions: permissions?.slice(0, 5),
                effectivePermissions: user?.effectivePermissions
            };
        });
        
        console.log('🎯 Permission Test Results:', JSON.stringify(permissionTest, null, 2));
        
        // Try to access dashboard and see what happens
        console.log('🚀 Navigating to dashboard...');
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
        
        // Take screenshot
        await page.screenshot({ path: 'test-screenshots/auth-dashboard.png' });
        
        // Check final URL and content
        const finalUrl = page.url();
        const pageContent = await page.evaluate(() => {
            return {
                url: window.location.href,
                hasErrorMessage: document.body.textContent?.includes('permission'),
                hasErrorText: document.body.textContent?.includes('SALE_VIEW') || document.body.textContent?.includes('RENTAL_VIEW'),
                title: document.title,
                bodyText: document.body.textContent?.substring(0, 500)
            };
        });
        
        console.log('📄 Dashboard Page State:', JSON.stringify(pageContent, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testAuthStore().catch(console.error);