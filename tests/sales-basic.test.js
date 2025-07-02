describe('Basic Sales Test', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('basic puppeteer test', async () => {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000');
    const title = await page.title();
    console.log('Page title:', title);
    
    await browser.close();
    expect(title).toBeTruthy();
  }, 30000);
});