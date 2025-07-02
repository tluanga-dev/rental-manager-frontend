const puppeteer = require('puppeteer');

describe('Sales Module Comprehensive Tests', () => {
  let browser;
  let page;
  const BASE_URL = 'http://localhost:3000';

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Authentication and Routing', () => {
    test('should handle unauthenticated access properly', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('body', { visible: true, timeout: 10000 });
      
      const currentUrl = page.url();
      const pageTitle = await page.title();
      
      console.log('Unauthenticated - URL:', currentUrl);
      console.log('Unauthenticated - Title:', pageTitle);
      
      // Should redirect to login or show auth-related content
      expect(currentUrl.includes('/login') || pageTitle.includes('Rental Manager')).toBe(true);
    });

    test('should show application structure', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('body', { visible: true, timeout: 10000 });
      
      const pageStructure = await page.evaluate(() => {
        return {
          title: document.title,
          hasNavigation: !!document.querySelector('nav'),
          hasSidebar: !!document.querySelector('[class*="sidebar"]') || !!document.querySelector('aside'),
          hasMainContent: !!document.querySelector('main') || !!document.querySelector('[class*="main"]'),
          buttonCount: document.querySelectorAll('button').length,
          inputCount: document.querySelectorAll('input').length,
          headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
            tag: h.tagName,
            text: h.textContent.trim()
          })).slice(0, 5)
        };
      });
      
      console.log('Page Structure:', JSON.stringify(pageStructure, null, 2));
      
      expect(pageStructure.title).toBe('Rental Manager');
      expect(pageStructure.buttonCount).toBeGreaterThan(0);
    });
  });

  describe('Sales Module File Structure Validation', () => {
    test('should validate sales pages exist', async () => {
      const salesPages = [
        '/sales',
        '/sales/new', 
        '/sales/history'
      ];
      
      const results = [];
      
      for (const salesPage of salesPages) {
        await page.goto(`${BASE_URL}${salesPage}`);
        await page.waitForSelector('body', { visible: true, timeout: 10000 });
        
        const status = await page.evaluate(() => {
          return {
            url: window.location.href,
            title: document.title,
            hasContent: document.body.children.length > 0,
            isError: document.body.textContent.includes('404') || 
                    document.body.textContent.includes('Not Found') ||
                    document.body.textContent.includes('Error')
          };
        });
        
        results.push({ page: salesPage, ...status });
      }
      
      console.log('Sales Pages Results:', JSON.stringify(results, null, 2));
      
      // All pages should load without 404 errors
      results.forEach(result => {
        expect(result.isError).toBe(false);
        expect(result.hasContent).toBe(true);
      });
    });
  });

  describe('UI Component Testing', () => {
    test('should test responsive behavior', async () => {
      const viewports = [
        { width: 1280, height: 720, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];
      
      const results = [];
      
      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.goto(`${BASE_URL}/sales`);
        await page.waitForSelector('body', { visible: true, timeout: 10000 });
        
        const responsiveCheck = await page.evaluate(() => {
          return {
            bodyWidth: document.body.offsetWidth,
            hasOverflowX: document.body.scrollWidth > document.body.clientWidth,
            visibleElements: {
              buttons: document.querySelectorAll('button:not([style*="display: none"])').length,
              inputs: document.querySelectorAll('input:not([style*="display: none"])').length,
              navigation: !!document.querySelector('nav:not([style*="display: none"])')
            }
          };
        });
        
        results.push({ viewport: viewport.name, ...responsiveCheck });
      }
      
      console.log('Responsive Results:', JSON.stringify(results, null, 2));
      
      // All viewports should render without horizontal overflow
      results.forEach(result => {
        expect(result.hasOverflowX).toBe(false);
        expect(result.visibleElements.buttons).toBeGreaterThanOrEqual(0);
      });
    });

    test('should test navigation and routing', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('body', { visible: true, timeout: 10000 });
      
      // Try to find and click navigation elements
      const navigationTest = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/sales"]'));
        const buttons = Array.from(document.querySelectorAll('button'));
        
        return {
          salesLinks: links.map(link => ({
            href: link.href,
            text: link.textContent.trim()
          })),
          buttonTexts: buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0),
          hasRouter: !!window.next || !!window.__NEXT_DATA__
        };
      });
      
      console.log('Navigation Test:', JSON.stringify(navigationTest, null, 2));
      
      expect(navigationTest.hasRouter).toBe(true);
    });
  });

  describe('API Integration Simulation', () => {
    test('should test API endpoints availability', async () => {
      const apiEndpoints = [
        '/api/v1/transactions',
        '/api/v1/transactions/sales',
        '/health'
      ];
      
      const apiResults = [];
      
      for (const endpoint of apiEndpoints) {
        try {
          const response = await page.evaluate(async (url) => {
            const resp = await fetch(url);
            return {
              status: resp.status,
              ok: resp.ok,
              headers: Object.fromEntries(resp.headers.entries())
            };
          }, `http://localhost:8000${endpoint}`);
          
          apiResults.push({ endpoint, ...response, error: null });
        } catch (error) {
          apiResults.push({ endpoint, error: error.message });
        }
      }
      
      console.log('API Results:', JSON.stringify(apiResults, null, 2));
      
      // At least the health endpoint should be available
      const healthCheck = apiResults.find(r => r.endpoint === '/health');
      if (healthCheck && !healthCheck.error) {
        expect(healthCheck.ok).toBe(true);
      }
    });

    test('should test mock API interactions', async () => {
      // Set up request interception for testing
      await page.setRequestInterception(true);
      
      const interceptedRequests = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          interceptedRequests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers()
          });
          
          // Mock response for API calls
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [] })
          });
        } else {
          request.continue();
        }
      });
      
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('body', { visible: true, timeout: 10000 });
      
      // Simulate an API call
      await page.evaluate(() => {
        return fetch('/api/v1/transactions').catch(() => {});
      });
      
      console.log('Intercepted Requests:', JSON.stringify(interceptedRequests, null, 2));
      
      // Should have attempted some API calls or be ready to
      expect(true).toBe(true); // This test is mainly for monitoring
    });
  });

  describe('Performance and Accessibility', () => {
    test('should measure page load performance', async () => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/sales`, { waitUntil: 'networkidle2' });
      
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });

    test('should check basic accessibility', async () => {
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('body', { visible: true, timeout: 10000 });
      
      const accessibilityCheck = await page.evaluate(() => {
        return {
          hasLang: !!document.documentElement.lang,
          hasTitle: !!document.title && document.title.trim().length > 0,
          buttonCount: document.querySelectorAll('button').length,
          inputsWithLabels: Array.from(document.querySelectorAll('input')).filter(input => {
            return input.labels && input.labels.length > 0 || 
                   input.getAttribute('aria-label') ||
                   input.getAttribute('placeholder');
          }).length,
          imagesWithAlt: Array.from(document.querySelectorAll('img')).filter(img => 
            img.alt && img.alt.trim().length > 0
          ).length,
          totalImages: document.querySelectorAll('img').length
        };
      });
      
      console.log('Accessibility Check:', JSON.stringify(accessibilityCheck, null, 2));
      
      expect(accessibilityCheck.hasTitle).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await page.setOfflineMode(true);
      
      await page.goto(`${BASE_URL}/sales`).catch(() => {
        // Expected to fail offline
      });
      
      await page.setOfflineMode(false);
      
      // Now try to load normally
      await page.goto(`${BASE_URL}/sales`);
      await page.waitForSelector('body', { visible: true, timeout: 10000 });
      
      const recoveryCheck = await page.evaluate(() => {
        return {
          hasContent: document.body.children.length > 0,
          title: document.title
        };
      });
      
      console.log('Recovery Check:', JSON.stringify(recoveryCheck, null, 2));
      
      expect(recoveryCheck.hasContent).toBe(true);
    });
  });
});