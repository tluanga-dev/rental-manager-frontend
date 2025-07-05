const puppeteer = require('puppeteer');

async function testDashboardAccess() {
    console.log('🚀 Testing dashboard access with fixed permissions...');
    
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Clear any existing session
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // Navigate to login page
        console.log('📍 Navigating to login page...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
        
        // Set up response listener
        page.on('response', response => {
            if (response.url().includes('/auth/login')) {
                console.log(`🔔 Login API Response: ${response.status()} ${response.statusText()}`);
            }
        });
        
        // Click demo admin button
        console.log('🖱️ Clicking Demo as Administrator button...');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const adminButton = buttons.find(button => 
                button.textContent?.includes('Demo as Administrator')
            );
            if (adminButton) {
                console.log('Found and clicking admin button');
                adminButton.click();
            }
        });
        
        // Wait for navigation
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        
        // Check auth store after login
        const authStateAfterLogin = await page.evaluate(() => {
            const authStorage = localStorage.getItem('auth-storage');
            if (!authStorage) return { error: 'No auth storage' };
            
            const parsed = JSON.parse(authStorage);
            const state = parsed.state || {};
            
            return {
                isAuthenticated: state.isAuthenticated,
                userEmail: state.user?.email,
                userType: state.user?.userType,
                isSuperuser: state.user?.isSuperuser,
                permissionsCount: state.permissions?.length || 0,
                hasSaleView: state.permissions?.includes('SALE_VIEW'),
                hasRentalView: state.permissions?.includes('RENTAL_VIEW'),
                firstFivePermissions: state.permissions?.slice(0, 5)
            };
        });
        
        console.log('✅ Auth State After Login:', JSON.stringify(authStateAfterLogin, null, 2));
        
        // Get current URL
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        // If we're on dashboard, great! If not, try to navigate to it
        if (!currentUrl.includes('/dashboard')) {
            console.log('🚀 Navigating to dashboard...');
            await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
        }
        
        // Take screenshot
        await page.screenshot({ path: 'test-screenshots/dashboard-final.png' });
        
        // Check final state
        const finalState = await page.evaluate(() => {
            const url = window.location.href;
            const bodyText = document.body.textContent || '';
            
            return {
                url: url,
                isOnDashboard: url.includes('/dashboard'),
                hasPermissionError: bodyText.includes('permission') || bodyText.includes('SALE_VIEW') || bodyText.includes('RENTAL_VIEW'),
                hasInsufficientPermissionsText: bodyText.includes('Insufficient Permissions'),
                hasDashboardContent: bodyText.includes('Dashboard') && !bodyText.includes('Insufficient'),
                pageTitle: document.title,
                errorMessage: document.querySelector('.alert-description')?.textContent || null
            };
        });
        
        console.log('\n📊 FINAL RESULTS:');
        console.log('================');
        console.log(JSON.stringify(finalState, null, 2));
        
        if (finalState.isOnDashboard && finalState.hasDashboardContent && !finalState.hasPermissionError) {
            console.log('\n🎉 SUCCESS! Dashboard access works correctly!');
        } else {
            console.log('\n❌ FAILED! Still having permission issues');
            console.log('Debug info:', {
                permissionsLoaded: authStateAfterLogin.permissionsCount > 0,
                hasRequiredPermissions: authStateAfterLogin.hasSaleView && authStateAfterLogin.hasRentalView,
                isSuperuser: authStateAfterLogin.isSuperuser
            });
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        // Keep browser open for inspection
        console.log('\n⏸️  Browser will close in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

testDashboardAccess().catch(console.error);