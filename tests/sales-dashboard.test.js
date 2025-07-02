const puppeteer = require('puppeteer');

describe('Sales Dashboard Tests', () => {
  let browser;
  let page;
  const BASE_URL = 'http://localhost:3000';

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Mock authentication by setting localStorage
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: {
              name: 'Admin',
              permissions: ['SALE_VIEW', 'SALE_CREATE', 'SALE_UPDATE', 'SALE_DELETE']
            }
          },
          token: 'mock-jwt-token',
          isAuthenticated: true
        },
        version: 0
      }));
    });
  });

  afterEach(async () => {
    await page.close();
  });

  test('should load sales dashboard page', async () => {
    await page.goto(`${BASE_URL}/sales`);
    
    // Wait for the page to load
    await page.waitForSelector('h1', { visible: true, timeout: 10000 });
    
    // Check page title
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toBe('Sales Management');
  }, 15000);

  test('should have New Sale button', async () => {
    await page.goto(`${BASE_URL}/sales`);
    await page.waitForSelector('h1', { visible: true, timeout: 10000 });
    
    // Look for New Sale button
    const newSaleButton = await page.$('button:has-text("New Sale")');
    expect(newSaleButton).toBeTruthy();
  }, 15000);

  test('should display stats cards', async () => {
    await page.goto(`${BASE_URL}/sales`);
    await page.waitForSelector('h1', { visible: true, timeout: 10000 });
    
    // Check for stats grid
    const statsGrid = await page.$('.grid.gap-4');
    expect(statsGrid).toBeTruthy();
  }, 15000);
});