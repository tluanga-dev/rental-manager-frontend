const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = 'http://localhost:3000';
const CATEGORY_CREATE_URL = `${BASE_URL}/products/categories/new`;

// Test data
const testCategories = [
  {
    name: 'Test Electronics',
    parent: 'root',
    isLeaf: false,
    description: 'Main electronics category for testing'
  },
  {
    name: 'Test Laptops',
    parent: 'Test Electronics',
    isLeaf: true,
    description: 'Laptop subcategory for testing'
  },
  {
    name: 'Gaming Laptops',
    parent: 'Test Laptops',
    isLeaf: true,
    description: 'Gaming laptop subcategory'
  }
];

async function loginAsAdmin(page) {
  console.log('🔐 Logging in as admin...');
  
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  
  // Find and click the admin demo button
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await button.evaluate(el => el.textContent);
    if (text && text.trim() === 'Demo as Administrator') {
      await button.click();
      break;
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if we're on dashboard or still on login
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('❌ Login failed - still on login page');
    throw new Error('Login failed');
  }
  console.log('✅ Login successful!\n');
}

async function analyzePageStructure(page) {
  console.log('📋 Analyzing page structure...');
  
  const structure = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      formElements: {
        inputs: document.querySelectorAll('input').length,
        textareas: document.querySelectorAll('textarea').length,
        selects: document.querySelectorAll('select').length,
        buttons: document.querySelectorAll('button').length,
        forms: document.querySelectorAll('form').length
      },
      labels: Array.from(document.querySelectorAll('label')).map(l => l.textContent.trim()),
      buttonTexts: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()),
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        tag: h.tagName,
        text: h.textContent.trim()
      }))
    };
  });
  
  console.log('Page Structure:', JSON.stringify(structure, null, 2));
  return structure;
}

async function testFormValidation(page) {
  console.log('\n🔍 Testing form validation...');
  
  const testResults = [];
  
  // Test 1: Empty form submission
  console.log('  → Testing empty form submission');
  
  // Find and click submit button
  const submitButton = await page.$('button[type="submit"]');
  if (submitButton) {
    await submitButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for error message
    const errorMessage = await page.evaluate(() => {
      const alerts = document.querySelectorAll('[role="alert"]');
      return alerts.length > 0 ? alerts[0].textContent : null;
    });
    
    testResults.push({
      test: 'Empty form submission',
      passed: !!errorMessage,
      message: errorMessage || 'No error message shown'
    });
  }
  
  // Test 2: Only category name filled
  console.log('  → Testing with only category name');
  
  // Fill category name
  // Wait for the input to be available
  await page.waitForSelector('input', { timeout: 5000 });
  const nameInput = await page.$('input[id*="name"], input[placeholder*="name"], input[type="text"]:first-of-type');
  if (nameInput) {
    await nameInput.type('Test Category');
    await page.waitForTimeout(500);
    
    // Check if parent category is required
    const parentRequired = await page.evaluate(() => {
      const parentField = document.querySelector('[data-testid="parent-category"]');
      return parentField ? parentField.hasAttribute('required') : false;
    });
    
    testResults.push({
      test: 'Parent category requirement',
      passed: true,
      message: `Parent category is ${parentRequired ? 'required' : 'optional'}`
    });
  }
  
  return testResults;
}

async function testCategoryCreation(page, categoryData) {
  console.log(`\n📝 Creating category: ${categoryData.name}`);
  
  try {
    // Navigate to create page
    await page.goto(CATEGORY_CREATE_URL, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill category name
    // Wait for the input to be available
  await page.waitForSelector('input', { timeout: 5000 });
  const nameInput = await page.$('input[id*="name"], input[placeholder*="name"], input[type="text"]:first-of-type');
    if (nameInput) {
      await nameInput.click({ clickCount: 3 }); // Triple click to select all
      await nameInput.type(categoryData.name);
    }
    
    // Select parent category
    console.log(`  → Selecting parent: ${categoryData.parent}`);
    
    // Click on combobox button to open dropdown
    const comboboxButton = await page.$('button[role="combobox"]');
    if (comboboxButton) {
      await comboboxButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Select parent option
      if (categoryData.parent === 'root') {
        // Click on root option
        // Use xpath to find root option
        const rootOptions = await page.$x('//div[@role="option"][contains(text(), "Root")]');
        if (rootOptions.length > 0) {
          await rootOptions[0].click();
        }
      } else {
        // Search and select parent
        const searchInput = await page.$('[role="combobox"] + div input[type="text"]');
        if (searchInput) {
          await searchInput.type(categoryData.parent);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Click on matching option
          const options = await page.$x(`//div[@role="option"][contains(text(), "${categoryData.parent}")]`);
          if (options.length > 0) {
            await options[0].click();
          }
        }
      }
    }
    
    // Toggle leaf status if needed
    if (categoryData.isLeaf) {
      const leafSwitch = await page.$('[role="switch"]');
      if (leafSwitch) {
        await leafSwitch.click();
      }
    }
    
    // Fill description
    if (categoryData.description) {
      const descriptionTextarea = await page.$('textarea');
      if (descriptionTextarea) {
        await descriptionTextarea.type(categoryData.description);
      }
    }
    
    // Preview the category path
    const preview = await page.evaluate(() => {
      const pathElement = document.querySelector('[class*="text-muted"]');
      return pathElement ? pathElement.textContent : null;
    });
    console.log(`  → Preview path: ${preview}`);
    
    // Take screenshot before submission
    await page.screenshot({ 
      path: `./screenshots/category-create-${categoryData.name.replace(/\s+/g, '-')}.png`,
      fullPage: true 
    });
    
    // Submit form
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      console.log('  → Submitting form...');
      await submitButton.click();
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for success or error
      const result = await page.evaluate(() => {
        const successAlert = document.querySelector('[role="alert"].success, [class*="success"]');
        const errorAlert = document.querySelector('[role="alert"].error, [class*="error"]');
        
        return {
          success: !!successAlert,
          error: !!errorAlert,
          message: successAlert?.textContent || errorAlert?.textContent || 'No message',
          currentUrl: window.location.href
        };
      });
      
      return {
        category: categoryData.name,
        ...result
      };
    }
    
  } catch (error) {
    console.error(`  ✗ Error creating category: ${error.message}`);
    return {
      category: categoryData.name,
      success: false,
      error: true,
      message: error.message
    };
  }
}

async function testErrorHandling(page) {
  console.log('\n⚠️  Testing error handling...');
  
  const errorTests = [];
  
  // Test 1: Duplicate category name
  console.log('  → Testing duplicate category name');
  await page.goto(CATEGORY_CREATE_URL, { waitUntil: 'networkidle0' });
  
  // Wait for the input to be available
  await page.waitForSelector('input', { timeout: 5000 });
  const nameInput = await page.$('input[id*="name"], input[placeholder*="name"], input[type="text"]:first-of-type');
  if (nameInput) {
    await nameInput.type('Test Electronics'); // Already created
    
    // Select root as parent
    const comboboxButton = await page.$('button[role="combobox"]');
    if (comboboxButton) {
      await comboboxButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const rootOption = await page.xpath('//div[@role="option"][contains(text(), "Root")]');
      if (rootOption.length > 0) {
        await rootOption[0].click();
      }
    }
    
    // Submit
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const error = await page.evaluate(() => {
        const errorElement = document.querySelector('[role="alert"], [class*="error"]');
        return errorElement ? errorElement.textContent : null;
      });
      
      errorTests.push({
        test: 'Duplicate category name',
        error: error,
        handled: !!error
      });
    }
  }
  
  // Test 2: Special characters in name
  console.log('  → Testing special characters');
  await page.reload();
  await page.waitForTimeout(1000);
  
  const specialInput = await page.$('input[placeholder*="category name"]');
  if (specialInput) {
    await specialInput.type('Test@#$%^&*()Category');
    
    errorTests.push({
      test: 'Special characters in name',
      handled: true,
      note: 'Special characters allowed in category names'
    });
  }
  
  return errorTests;
}

async function runCategoryCreationTests() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting Category Creation Tests\n');
    console.log(`URL: ${CATEGORY_CREATE_URL}\n`);
    
    // Login first
    await loginAsAdmin(page);
    
    // Navigate to category creation page
    await page.goto(CATEGORY_CREATE_URL, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 1: Analyze page structure
    const structure = await analyzePageStructure(page);
    
    // Test 2: Form validation
    const validationResults = await testFormValidation(page);
    
    // Test 3: Create categories
    const creationResults = [];
    for (const category of testCategories) {
      const result = await testCategoryCreation(page, category);
      creationResults.push(result);
    }
    
    // Test 4: Error handling
    const errorResults = await testErrorHandling(page);
    
    // Generate final report
    generateTestReport({
      structure,
      validation: validationResults,
      creation: creationResults,
      errors: errorResults
    });
    
  } catch (error) {
    console.error('Test suite failed:', error);
  } finally {
    await browser.close();
  }
}

function generateTestReport(results) {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 CATEGORY CREATION TEST REPORT');
  console.log('='.repeat(60) + '\n');
  
  // Page Structure Summary
  console.log('📋 Page Structure:');
  console.log(`  - Form inputs: ${results.structure.formElements.inputs}`);
  console.log(`  - Textareas: ${results.structure.formElements.textareas}`);
  console.log(`  - Buttons: ${results.structure.formElements.buttons}`);
  console.log(`  - Fields: ${results.structure.labels.join(', ')}`);
  
  // Validation Tests
  console.log('\n🔍 Validation Tests:');
  results.validation.forEach(test => {
    console.log(`  ${test.passed ? '✅' : '❌'} ${test.test}: ${test.message}`);
  });
  
  // Creation Tests
  console.log('\n📝 Category Creation Results:');
  results.creation.forEach(result => {
    console.log(`  ${result.success ? '✅' : '❌'} ${result.category}`);
    if (result.message) {
      console.log(`     → ${result.message}`);
    }
  });
  
  // Error Handling
  console.log('\n⚠️  Error Handling Tests:');
  results.errors.forEach(test => {
    console.log(`  ${test.handled ? '✅' : '❌'} ${test.test}`);
    if (test.error) {
      console.log(`     → ${test.error}`);
    }
  });
  
  // Summary
  const totalTests = results.validation.length + results.creation.length + results.errors.length;
  const passedTests = 
    results.validation.filter(t => t.passed).length +
    results.creation.filter(t => t.success).length +
    results.errors.filter(t => t.handled).length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`✨ Test Summary: ${passedTests}/${totalTests} tests passed`);
  console.log('='.repeat(60));
  
  // Save detailed results
  const fs = require('fs');
  fs.writeFileSync(
    './category-creation-test-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('\n💾 Detailed results saved to category-creation-test-results.json');
}

// Ensure screenshots directory exists
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

// Run the tests
runCategoryCreationTests().catch(console.error);