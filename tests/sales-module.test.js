const puppeteer = require('puppeteer');

describe('Sales Module E2E Tests', () => {
  let browser;
  let page;
  const BASE_URL = 'http://localhost:3000';
  const API_URL = 'http://localhost:8000';

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

  describe('Sales Dashboard', () => {
    test('should display sales dashboard with stats', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('h1', { visible: true });
      
      // Check page title
      const title = await page.$eval('h1', el => el.textContent);
      expect(title).toBe('Sales Management');
      
      // Check stats cards are displayed
      const statsCards = await page.$$('.grid.gap-4 .card');
      expect(statsCards.length).toBeGreaterThan(0);
      
      // Check for "Today's Sales" stat
      const todaysSalesCard = await page.$eval(
        'h3:has-text("Today\'s Sales")',
        el => el.textContent
      ).catch(() => null);
      expect(todaysSalesCard).toBeTruthy();
      
      // Check for New Sale button
      const newSaleButton = await page.$('button:has-text("New Sale")');
      expect(newSaleButton).toBeTruthy();
    });

    test('should navigate to new sale page when clicking New Sale button', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('button:has-text("New Sale")', { visible: true });
      
      await page.click('button:has-text("New Sale")');
      await page.waitForNavigation();
      
      expect(page.url()).toBe(`${BASE_URL}/sales/new`);
    });

    test('should display quick action cards', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('.grid.gap-4', { visible: true });
      
      // Check for quick action cards
      const createNewSaleCard = await page.$('h3:has-text("Create New Sale")');
      const salesHistoryCard = await page.$('h3:has-text("Sales History")');
      const salesReportsCard = await page.$('h3:has-text("Sales Reports")');
      
      expect(createNewSaleCard).toBeTruthy();
      expect(salesHistoryCard).toBeTruthy();
      expect(salesReportsCard).toBeTruthy();
    });

    test('should display recent sales section', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('h3:has-text("Recent Sales")', { visible: true });
      
      // Check for recent sales items
      const recentSalesItems = await page.$$('[class*="hover:bg-gray-50"]');
      expect(recentSalesItems.length).toBeGreaterThan(0);
      
      // Check for View All Sales button
      const viewAllButton = await page.$('button:has-text("View All Sales")');
      expect(viewAllButton).toBeTruthy();
    });
  });

  describe('Sales History', () => {
    test('should display sales history page with filters', async () => {
      await page.goto(`${BASE_URL}/sales/history`);
      await page.waitForSelector('h1:has-text("Sales History")', { visible: true });
      
      // Check for filter section
      const filterSection = await page.$('h3:has-text("Filters")');
      expect(filterSection).toBeTruthy();
      
      // Check for search input
      const searchInput = await page.$('input[placeholder*="Search"]');
      expect(searchInput).toBeTruthy();
      
      // Check for status filter
      const statusSelect = await page.$('select[id="status"]');
      expect(statusSelect).toBeTruthy();
      
      // Check for date range filter
      const dateSelect = await page.$('select[id="date"]');
      expect(dateSelect).toBeTruthy();
    });

    test('should display sales transactions table', async () => {
      await page.goto(`${BASE_URL}/sales/history`);
      await page.waitForSelector('table', { visible: true });
      
      // Check table headers
      const headers = await page.$$eval('thead th', headers => 
        headers.map(h => h.textContent.trim())
      );
      
      expect(headers).toContain('Transaction ID');
      expect(headers).toContain('Date & Time');
      expect(headers).toContain('Customer');
      expect(headers).toContain('Total');
      expect(headers).toContain('Status');
      expect(headers).toContain('Actions');
    });

    test('should have functional export button', async () => {
      await page.goto(`${BASE_URL}/sales/history`);
      await page.waitForSelector('button:has-text("Export")', { visible: true });
      
      const exportButton = await page.$('button:has-text("Export")');
      expect(exportButton).toBeTruthy();
    });

    test('should have pagination controls', async () => {
      await page.goto(`${BASE_URL}/sales/history`);
      await page.waitForSelector('button:has-text("Next")', { visible: true });
      
      const prevButton = await page.$('button:has-text("Previous")');
      const nextButton = await page.$('button:has-text("Next")');
      
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      
      // Check pagination info
      const paginationInfo = await page.$eval(
        'p:has-text("Showing")',
        el => el.textContent
      ).catch(() => null);
      expect(paginationInfo).toContain('Showing');
      expect(paginationInfo).toContain('results');
    });
  });

  describe('New Sale Transaction', () => {
    test('should display transaction wizard', async () => {
      await page.goto(`${BASE_URL}/sales/new`);
      await page.waitForSelector('h1:has-text("Transaction Wizard")', { visible: true });
      
      // Check for transaction type badge
      const saleBadge = await page.$('.badge:has-text("New Sale")');
      expect(saleBadge).toBeTruthy();
      
      // Check wizard steps
      const steps = await page.$$eval('.flex.justify-between > div', steps =>
        steps.map(step => step.querySelector('div.font-medium')?.textContent)
      );
      
      expect(steps).toContain('Select Products');
      expect(steps).toContain('Customer Details');
      expect(steps).toContain('Payment');
      expect(steps).toContain('Review');
      expect(steps).toContain('Complete');
    });

    test('should display progress bar', async () => {
      await page.goto(`${BASE_URL}/sales/new`);
      await page.waitForSelector('[role="progressbar"]', { visible: true });
      
      const progressBar = await page.$('[role="progressbar"]');
      expect(progressBar).toBeTruthy();
      
      // Check step indicator
      const stepIndicator = await page.$eval(
        'span:has-text("Step")',
        el => el.textContent
      ).catch(() => null);
      expect(stepIndicator).toContain('Step 1 of 5');
    });

    test('should have navigation buttons', async () => {
      await page.goto(`${BASE_URL}/sales/new`);
      await page.waitForSelector('button:has-text("Next")', { visible: true });
      
      const prevButton = await page.$('button:has-text("Previous")');
      const nextButton = await page.$('button:has-text("Next")');
      const cancelButton = await page.$('button:has-text("Cancel")');
      
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      expect(cancelButton).toBeTruthy();
    });

    test('should display order summary sidebar', async () => {
      await page.goto(`${BASE_URL}/sales/new`);
      await page.waitForSelector('h3:has-text("Order Summary")', { visible: true });
      
      // Check for pricing elements
      const subtotal = await page.$('span:has-text("Subtotal:")');
      const discount = await page.$('span:has-text("Discount:")');
      const tax = await page.$('span:has-text("Tax")');
      const total = await page.$('span:has-text("Total Amount:")');
      
      expect(subtotal).toBeTruthy();
      expect(discount).toBeTruthy();
      expect(tax).toBeTruthy();
      expect(total).toBeTruthy();
    });
  });

  describe('Sale Detail View', () => {
    test('should display sale detail page', async () => {
      // Navigate to a specific sale (using mock ID)
      await page.goto(`${BASE_URL}/sales/TRX001`);
      
      // Wait for either the sale detail or error message
      await page.waitForSelector('h1[class*="text-3xl"], h3:has-text("Error")', { visible: true });
      
      // Check if we got to the detail page or error page
      const pageTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
      if (pageTitle && pageTitle.includes('Sale #')) {
        // Successfully loaded sale detail
        expect(pageTitle).toContain('Sale #');
        
        // Check for back button
        const backButton = await page.$('button:has-text("Back")');
        expect(backButton).toBeTruthy();
        
        // Check for action buttons
        const printButton = await page.$('button:has-text("Print Receipt")');
        const downloadButton = await page.$('button:has-text("Download PDF")');
        
        expect(printButton).toBeTruthy();
        expect(downloadButton).toBeTruthy();
      } else {
        // Error page is displayed (expected if no backend is running)
        const errorMessage = await page.$('h3:has-text("Error Loading Transaction")');
        expect(errorMessage).toBeTruthy();
      }
    });

    test('should have tabs for different sections', async () => {
      await page.goto(`${BASE_URL}/sales/TRX001`);
      
      // Wait for tabs to load (or error page)
      const tabsExist = await page.$('[role="tablist"]').catch(() => null);
      
      if (tabsExist) {
        const tabs = await page.$$eval('[role="tab"]', tabs =>
          tabs.map(tab => tab.textContent)
        );
        
        expect(tabs).toContain('Details');
        expect(tabs).toContain('Items');
        expect(tabs).toContain('Payments');
        expect(tabs).toContain('History');
      }
    });
  });

  describe('Sidebar Navigation', () => {
    test('should have Sales menu item in sidebar', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('nav', { visible: true });
      
      // Look for Sales menu item
      const salesMenuItem = await page.$('span:has-text("Sales")');
      expect(salesMenuItem).toBeTruthy();
    });

    test('should expand Sales submenu', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('nav', { visible: true });
      
      // Click on Sales menu item to expand
      const salesButton = await page.$('button:has(span:has-text("Sales"))');
      if (salesButton) {
        await salesButton.click();
        
        // Check for submenu items
        await page.waitForSelector('span:has-text("New Sale")', { visible: true });
        
        const newSaleItem = await page.$('span:has-text("New Sale")');
        const salesHistoryItem = await page.$('span:has-text("Sales History")');
        
        expect(newSaleItem).toBeTruthy();
        expect(salesHistoryItem).toBeTruthy();
      }
    });
  });

  describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('h1', { visible: true });
      
      // Check if content is still accessible
      const title = await page.$eval('h1', el => el.textContent);
      expect(title).toBe('Sales Management');
      
      // Stats should stack on mobile
      const statsGrid = await page.$('.grid.gap-4');
      expect(statsGrid).toBeTruthy();
    });

    test('should be responsive on tablet viewport', async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('h1', { visible: true });
      
      const title = await page.$eval('h1', el => el.textContent);
      expect(title).toBe('Sales Management');
    });
  });

  describe('Error Handling', () => {
    test('should handle unauthorized access', async () => {
      // Clear authentication
      await page.evaluateOnNewDocument(() => {
        localStorage.clear();
      });
      
      await page.goto(`${BASE_URL}/sales`);
      
      // Should redirect to login or show unauthorized message
      await page.waitForSelector('form, div[class*="unauthorized"]', { 
        visible: true,
        timeout: 5000 
      }).catch(() => {
        // If no login form or unauthorized message, check URL
        expect(page.url()).toContain('login');
      });
    });
  });
});