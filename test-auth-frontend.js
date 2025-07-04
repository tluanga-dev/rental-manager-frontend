const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000/api/v1';
const TEST_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function printTest(testName, passed, details = '') {
  const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (details) {
    console.log(`  ${colors.yellow}Details: ${details}${colors.reset}`);
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testLoginFlow(page) {
  console.log(`\n${colors.blue}Testing Login Flow${colors.reset}`);
  
  try {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    const loginPageLoaded = await page.title();
    printTest('Login Page Load', true, `Title: ${loginPageLoaded}`);
    
    // Check for login form elements
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    const formElementsPresent = emailInput && passwordInput && submitButton;
    printTest('Login Form Elements', formElementsPresent);
    
    if (formElementsPresent) {
      // Fill in credentials
      await emailInput.type(TEST_CREDENTIALS.email);
      await passwordInput.type(TEST_CREDENTIALS.password);
      
      // Submit form
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        submitButton.click()
      ]);
      
      // Check if redirected to dashboard
      const currentUrl = page.url();
      const loginSuccess = currentUrl.includes('/dashboard');
      printTest('Login Success & Redirect', loginSuccess, `URL: ${currentUrl}`);
      
      return loginSuccess;
    }
    
    return false;
  } catch (error) {
    printTest('Login Flow', false, error.message);
    return false;
  }
}

async function testAuthPersistence(page) {
  console.log(`\n${colors.blue}Testing Authentication Persistence${colors.reset}`);
  
  try {
    // Check localStorage for auth tokens
    const authData = await page.evaluate(() => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      return { hasToken: !!token, hasUser: !!user };
    });
    
    printTest('Auth Token Storage', authData.hasToken);
    printTest('User Data Storage', authData.hasUser);
    
    // Reload page and check if still authenticated
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(1000);
    
    const stillAuthenticated = !page.url().includes('/login');
    printTest('Auth Persistence After Reload', stillAuthenticated);
    
    return authData.hasToken && stillAuthenticated;
  } catch (error) {
    printTest('Auth Persistence', false, error.message);
    return false;
  }
}

async function testProtectedRoutes(page) {
  console.log(`\n${colors.blue}Testing Protected Routes${colors.reset}`);
  
  const routes = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products', path: '/products' },
    { name: 'Customers', path: '/customers' },
    { name: 'Sales', path: '/sales' },
    { name: 'Rentals', path: '/rentals' }
  ];
  
  let allPassed = true;
  
  for (const route of routes) {
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2' });
      await delay(500);
      
      const isProtected = !page.url().includes('/login');
      printTest(`Protected Route: ${route.name}`, isProtected, route.path);
      
      allPassed = allPassed && isProtected;
    } catch (error) {
      printTest(`Protected Route: ${route.name}`, false, error.message);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testLogout(page) {
  console.log(`\n${colors.blue}Testing Logout${colors.reset}`);
  
  try {
    // Look for logout button/link
    const logoutButton = await page.$('button:has-text("Logout"), a:has-text("Logout")');
    
    if (logoutButton) {
      await logoutButton.click();
      await delay(1000);
      
      // Check if redirected to login
      const redirectedToLogin = page.url().includes('/login');
      printTest('Logout Redirect', redirectedToLogin);
      
      // Check if tokens are cleared
      const tokensCleared = await page.evaluate(() => {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        return !token && !user;
      });
      
      printTest('Tokens Cleared', tokensCleared);
      
      return redirectedToLogin && tokensCleared;
    } else {
      printTest('Logout Button Found', false, 'No logout button found');
      return false;
    }
  } catch (error) {
    printTest('Logout', false, error.message);
    return false;
  }
}

async function testUnauthorizedAccess(page) {
  console.log(`\n${colors.blue}Testing Unauthorized Access${colors.reset}`);
  
  try {
    // Clear any existing auth
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to access protected route
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await delay(500);
    
    const redirectedToLogin = page.url().includes('/login');
    printTest('Unauthorized Redirect', redirectedToLogin);
    
    return redirectedToLogin;
  } catch (error) {
    printTest('Unauthorized Access', false, error.message);
    return false;
  }
}

async function testAPIIntegration(page) {
  console.log(`\n${colors.blue}Testing API Integration${colors.reset}`);
  
  try {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    
    // Set up request interception
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    // Perform login
    await page.type('input[type="email"]', TEST_CREDENTIALS.email);
    await page.type('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await delay(2000);
    
    // Check if login API was called
    const loginCall = apiCalls.find(call => call.url.includes('/auth/login'));
    printTest('Login API Call', !!loginCall, loginCall ? loginCall.method : 'No call');
    
    // Navigate to a page that loads data
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle2' });
    await delay(1000);
    
    // Check if API calls include auth headers
    const authenticatedCalls = apiCalls.filter(call => 
      call.headers['authorization'] && call.headers['authorization'].startsWith('Bearer ')
    );
    
    printTest('Authenticated API Calls', authenticatedCalls.length > 0, 
      `${authenticatedCalls.length} authenticated calls`);
    
    return !!loginCall && authenticatedCalls.length > 0;
  } catch (error) {
    printTest('API Integration', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log(`${colors.blue}=== Frontend Authentication Test Suite ===${colors.reset}\n`);
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Test unauthorized access first
    await testUnauthorizedAccess(page);
    
    // Test login flow
    const loginSuccess = await testLoginFlow(page);
    
    if (loginSuccess) {
      // Test authenticated features
      await testAuthPersistence(page);
      await testProtectedRoutes(page);
      await testAPIIntegration(page);
      await testLogout(page);
    }
    
  } catch (error) {
    console.error(`${colors.red}Test suite error:${colors.reset}`, error);
  } finally {
    await browser.close();
    console.log(`\n${colors.blue}=== Test Suite Complete ===${colors.reset}\n`);
  }
}

// Run the tests
runAllTests().catch(console.error);