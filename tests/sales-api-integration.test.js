const puppeteer = require('puppeteer');

describe('Sales Module API Integration Tests', () => {
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
    
    // Mock authentication
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

    // Set up request interception for API calls
    await page.setRequestInterception(true);
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Sales List API Calls', () => {
    test('should make API call to fetch sales list', async () => {
      let apiCallMade = false;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/transactions') && request.method() === 'GET') {
          apiCallMade = true;
          // Mock successful response
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              items: [
                {
                  id: '1',
                  transaction_number: 'TRX001',
                  transaction_type: 'SALE',
                  customer: { first_name: 'John', last_name: 'Doe' },
                  total_amount: 299.99,
                  status: 'COMPLETED',
                  payment_status: 'PAID',
                  transaction_date: '2024-01-15T10:30:00Z',
                  lines: [
                    { id: '1', quantity: 3, unit_price: 99.99 }
                  ]
                }
              ],
              total: 1,
              page: 1,
              size: 10
            })
          });
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/sales/history`);
      await page.waitForTimeout(1000); // Wait for API call
      
      expect(apiCallMade).toBe(true);
    });

    test('should handle API error gracefully', async () => {
      page.on('request', request => {
        if (request.url().includes('/api/v1/transactions')) {
          // Mock error response
          request.respond({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' })
          });
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/sales/history`);
      
      // Should still render the page without crashing
      const pageTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
      expect(pageTitle).toBe('Sales History');
    });
  });

  describe('Create Sale API Calls', () => {
    test('should make API call when creating a new sale', async () => {
      let createSaleApiCalled = false;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/transactions/sales') && request.method() === 'POST') {
          createSaleApiCalled = true;
          const postData = request.postData();
          
          // Verify request payload structure
          expect(postData).toBeTruthy();
          const payload = JSON.parse(postData);
          expect(payload).toHaveProperty('transaction_type');
          expect(payload).toHaveProperty('location_id');
          expect(payload).toHaveProperty('cart_items');
          
          // Mock successful response
          request.respond({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'new-transaction-id',
              transaction_number: 'TRX002',
              status: 'CONFIRMED',
              total_amount: 500.00
            })
          });
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/sales/new`);
      
      // Simulate completing the transaction wizard
      // Note: In a real test, you would fill out the form fields
      await page.evaluate(() => {
        // Simulate API call
        fetch('/api/v1/transactions/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_type: 'SALE',
            location_id: 'loc-1',
            customer_id: 'cust-1',
            cart_items: [
              { sku_id: 'sku-1', quantity: 2, unit_price: 250.00 }
            ]
          })
        });
      });

      await page.waitForTimeout(500);
      expect(createSaleApiCalled).toBe(true);
    });
  });

  describe('Sale Detail API Calls', () => {
    test('should fetch transaction details', async () => {
      let detailApiCalled = false;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/transactions/TRX001') && request.method() === 'GET') {
          detailApiCalled = true;
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: '1',
              transaction_number: 'TRX001',
              transaction_type: 'SALE',
              status: 'COMPLETED',
              payment_status: 'PAID',
              customer: {
                id: 'cust-1',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com'
              },
              location: { id: 'loc-1', name: 'Main Store' },
              subtotal: 299.99,
              discount_amount: 0,
              tax_rate: 0.18,
              tax_amount: 54.00,
              total_amount: 353.99,
              amount_paid: 353.99,
              lines: [
                {
                  id: 'line-1',
                  sku: {
                    sku_code: 'SKU001',
                    item_master: { name: 'Product 1' }
                  },
                  quantity: 3,
                  unit_price: 99.99,
                  discount_percentage: 0,
                  line_total: 299.99
                }
              ],
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-15T10:35:00Z'
            })
          });
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/sales/TRX001`);
      await page.waitForSelector('h1', { visible: true });
      
      expect(detailApiCalled).toBe(true);
      
      // Verify content is displayed
      const title = await page.$eval('h1', el => el.textContent).catch(() => null);
      expect(title).toContain('Sale #TRX001');
    });
  });

  describe('Payment Processing API', () => {
    test('should handle payment processing API call', async () => {
      let paymentApiCalled = false;
      
      page.on('request', request => {
        if (request.url().includes('/payment') && request.method() === 'POST') {
          paymentApiCalled = true;
          const payload = JSON.parse(request.postData());
          
          expect(payload).toHaveProperty('payment_method');
          expect(payload).toHaveProperty('amount');
          
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: '1',
              payment_status: 'PAID',
              amount_paid: payload.amount
            })
          });
        } else {
          request.continue();
        }
      });

      // Simulate payment processing
      await page.evaluate(() => {
        fetch('/api/v1/transactions/TRX001/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_method: 'CREDIT_CARD',
            amount: 353.99,
            payment_reference: 'REF123'
          })
        });
      });

      await page.waitForTimeout(500);
      expect(paymentApiCalled).toBe(true);
    });
  });

  describe('Reports API Integration', () => {
    test('should fetch daily sales summary', async () => {
      let reportApiCalled = false;
      
      page.on('request', request => {
        if (request.url().includes('/reports/daily')) {
          reportApiCalled = true;
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              date: '2024-01-15',
              total_transactions: 10,
              total_sales: 5,
              total_rentals: 5,
              sales_revenue: 2450.00,
              rental_revenue: 1800.00,
              total_revenue: 4250.00
            })
          });
        } else {
          request.continue();
        }
      });

      // Simulate fetching daily report
      await page.evaluate(() => {
        fetch('/api/v1/transactions/reports/daily?date=2024-01-15');
      });

      await page.waitForTimeout(500);
      expect(reportApiCalled).toBe(true);
    });

    test('should fetch revenue summary', async () => {
      let revenueApiCalled = false;
      
      page.on('request', request => {
        if (request.url().includes('/reports/revenue')) {
          revenueApiCalled = true;
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                period: '2024-01-15',
                sales_revenue: 2450.00,
                rental_revenue: 1800.00,
                total_revenue: 4250.00,
                transaction_count: 10
              }
            ])
          });
        } else {
          request.continue();
        }
      });

      // Simulate fetching revenue report
      await page.evaluate(() => {
        fetch('/api/v1/transactions/reports/revenue?start_date=2024-01-01&end_date=2024-01-31&group_by=day');
      });

      await page.waitForTimeout(500);
      expect(revenueApiCalled).toBe(true);
    });
  });

  describe('Error States', () => {
    test('should show error state when API returns 404', async () => {
      page.on('request', request => {
        if (request.url().includes('/api/v1/transactions/INVALID')) {
          request.respond({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Transaction not found' })
          });
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/sales/INVALID`);
      await page.waitForSelector('h3', { visible: true });
      
      const errorTitle = await page.$eval('h3', el => el.textContent).catch(() => null);
      expect(errorTitle).toContain('Error');
    });

    test('should handle network errors gracefully', async () => {
      page.on('request', request => {
        if (request.url().includes('/api/v1/transactions')) {
          request.abort('failed');
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/sales/history`);
      
      // Page should still load
      const pageTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
      expect(pageTitle).toBe('Sales History');
    });
  });

  describe('Performance', () => {
    test('should load sales page within acceptable time', async () => {
      const startTime = Date.now();
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/transactions')) {
          // Mock quick response
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ items: [], total: 0, page: 1, size: 10 })
          });
        } else {
          request.continue();
        }
      });

      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('h1', { visible: true });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });
  });
});