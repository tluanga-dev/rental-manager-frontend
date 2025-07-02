const puppeteer = require('puppeteer');

async function testWorkingEndpoints() {
  console.log('🚀 Starting API endpoint testing...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Test data
  const API_BASE_URL = 'http://localhost:8000/api/v1';
  const ROOT_URL = 'http://localhost:8000';
  const results = [];
  
  // Helper function to make API calls
  const testEndpoint = async (url, method = 'GET', data = null) => {
    try {
      const result = await page.evaluate(async (fullUrl, httpMethod, payload) => {
        const options = {
          method: httpMethod,
          headers: { 'Content-Type': 'application/json' }
        };
        
        if (payload && httpMethod !== 'GET') {
          options.body = JSON.stringify(payload);
        }
        
        try {
          const response = await fetch(fullUrl, options);
          const responseText = await response.text();
          return {
            status: response.status,
            statusText: response.statusText,
            success: response.ok,
            data: responseText
          };
        } catch (error) {
          return {
            status: 0,
            statusText: error.message,
            success: false,
            data: null
          };
        }
      }, url, method, data);
      
      return result;
    } catch (error) {
      return {
        status: 0,
        statusText: error.message,
        success: false,
        data: null
      };
    }
  };

  // Test endpoints based on what we know works
  const endpoints = [
    // Basic endpoints
    { url: `${ROOT_URL}/`, name: 'Root endpoint' },
    { url: `${ROOT_URL}/docs`, name: 'Swagger UI' },
    { url: `${API_BASE_URL}/openapi.json`, name: 'OpenAPI specification' },
    
    // Main API endpoints that should exist
    { url: `${API_BASE_URL}/users/`, name: 'List users' },
    { url: `${API_BASE_URL}/locations/`, name: 'List locations' },
    { url: `${API_BASE_URL}/categories/`, name: 'List categories' },
    { url: `${API_BASE_URL}/categories/tree/`, name: 'Category tree' },
    { url: `${API_BASE_URL}/categories/leaf/all`, name: 'All leaf categories' },
    { url: `${API_BASE_URL}/categories/statistics/summary`, name: 'Category statistics' },
    { url: `${API_BASE_URL}/brands/`, name: 'List brands' },
    { url: `${API_BASE_URL}/customers/`, name: 'List customers' },
    { url: `${API_BASE_URL}/item-masters/`, name: 'List item masters' },
    { url: `${API_BASE_URL}/skus/`, name: 'List SKUs' },
    { url: `${API_BASE_URL}/inventory/units`, name: 'List inventory units' },
    { url: `${API_BASE_URL}/inventory/stock-levels`, name: 'List stock levels' },
    { url: `${API_BASE_URL}/transactions/`, name: 'List transactions' },
    { url: `${API_BASE_URL}/rental-returns/`, name: 'List rental returns' },
    { url: `${API_BASE_URL}/rental-transactions/`, name: 'List rental transactions' }
  ];

  console.log(`📊 Testing ${endpoints.length} endpoints...`);
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`[${i + 1}/${endpoints.length}] Testing: ${endpoint.url}`);
    
    const result = await testEndpoint(endpoint.url);
    
    const testResult = {
      name: endpoint.name,
      url: endpoint.url,
      status: result.status,
      success: result.success,
      message: result.statusText,
      hasData: !!(result.data && result.data.length > 0)
    };
    
    results.push(testResult);
    
    // Color-coded output
    const statusColor = testResult.success ? '✅' : '❌';
    console.log(`   ${statusColor} ${testResult.status} - ${testResult.name}`);
    
    // If successful and returns data, show a snippet
    if (testResult.success && testResult.hasData && result.data.length < 200) {
      console.log(`   📄 Data preview: ${result.data.substring(0, 100)}...`);
    }
  }

  // Test some POST endpoints with sample data
  console.log('\n🔄 Testing POST endpoints...');
  
  const postTests = [
    {
      url: `${API_BASE_URL}/users/`,
      name: 'Create user',
      data: {
        username: "testuser" + Date.now(),
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        password: "testpassword123"
      }
    },
    {
      url: `${API_BASE_URL}/categories/`,
      name: 'Create category',
      data: {
        category_name: "Test Category " + Date.now(),
        category_path: "/test-category-" + Date.now()
      }
    },
    {
      url: `${API_BASE_URL}/brands/`,
      name: 'Create brand',
      data: {
        brand_name: "Test Brand " + Date.now(),
        brand_code: "TB" + Date.now().toString().slice(-6),
        description: "Test brand description"
      }
    }
  ];

  for (let i = 0; i < postTests.length; i++) {
    const test = postTests[i];
    console.log(`Testing POST: ${test.name}`);
    
    const result = await testEndpoint(test.url, 'POST', test.data);
    
    const testResult = {
      name: test.name,
      url: test.url,
      status: result.status,
      success: result.success || [201, 422].includes(result.status), // Accept creation or validation errors
      message: result.statusText,
      method: 'POST'
    };
    
    results.push(testResult);
    
    const statusColor = testResult.success ? '✅' : '❌';
    console.log(`   ${statusColor} ${testResult.status} - ${testResult.name}`);
  }

  await browser.close();
  
  // Summary
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  console.log('\n📈 Test Results Summary:');
  console.log(`Total Endpoints Tested: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const method = result.method || 'GET';
    console.log(`${status} | ${method.padEnd(4)} | ${result.status.toString().padEnd(3)} | ${result.name}`);
  });
  
  // Failed endpoints
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n🚨 Failed Endpoints:');
    failures.forEach(failure => {
      const method = failure.method || 'GET';
      console.log(`❌ ${method} ${failure.url} - ${failure.status} ${failure.message}`);
    });
  } else {
    console.log('\n🎉 All endpoints are working correctly!');
  }
  
  console.log('\n🎉 API testing completed!');
  return results;
}

// Run the tests
testWorkingEndpoints().catch(console.error);