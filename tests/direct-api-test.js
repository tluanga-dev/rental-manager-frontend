const puppeteer = require('puppeteer');

async function testAllEndpoints() {
  console.log('🚀 Starting comprehensive API endpoint testing...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Test data
  const API_BASE_URL = 'http://localhost:8000/api/v1';
  const results = [];
  
  // Helper function to make API calls
  const testEndpoint = async (path, method = 'GET', data = null) => {
    try {
      const result = await page.evaluate(async (url, httpMethod, payload) => {
        const options = {
          method: httpMethod,
          headers: { 'Content-Type': 'application/json' }
        };
        
        if (payload && httpMethod !== 'GET') {
          options.body = JSON.stringify(payload);
        }
        
        try {
          const response = await fetch(url, options);
          return {
            status: response.status,
            statusText: response.statusText,
            success: response.ok
          };
        } catch (error) {
          return {
            status: 0,
            statusText: error.message,
            success: false
          };
        }
      }, `${API_BASE_URL}${path}`, method, data);
      
      return result;
    } catch (error) {
      return {
        status: 0,
        statusText: error.message,
        success: false
      };
    }
  };

  // Test endpoints
  const endpoints = [
    // Health checks
    { path: '/', method: 'GET', name: 'Root endpoint' },
    { path: '/health', method: 'GET', name: 'Health check' },
    
    // Users
    { path: '/users/', method: 'GET', name: 'List users' },
    
    // Locations
    { path: '/locations/', method: 'GET', name: 'List locations' },
    
    // Categories
    { path: '/categories/', method: 'GET', name: 'List categories' },
    { path: '/categories/tree/', method: 'GET', name: 'Category tree' },
    { path: '/categories/leaf/all', method: 'GET', name: 'All leaf categories' },
    
    // Brands
    { path: '/brands/', method: 'GET', name: 'List brands' },
    
    // Customers
    { path: '/customers/', method: 'GET', name: 'List customers' },
    { path: '/customers/blacklisted/', method: 'GET', name: 'Blacklisted customers' },
    
    // Item Masters
    { path: '/item-masters/', method: 'GET', name: 'List item masters' },
    
    // SKUs
    { path: '/skus/', method: 'GET', name: 'List SKUs' },
    { path: '/skus/rentable/', method: 'GET', name: 'Rentable SKUs' },
    { path: '/skus/saleable/', method: 'GET', name: 'Saleable SKUs' },
    
    // Inventory
    { path: '/inventory/units', method: 'GET', name: 'List inventory units' },
    { path: '/inventory/stock-levels', method: 'GET', name: 'List stock levels' },
    { path: '/inventory/units/status-count', method: 'GET', name: 'Inventory status counts' },
    { path: '/inventory/units/condition-count', method: 'GET', name: 'Inventory condition counts' },
    { path: '/inventory/stock-levels/low-stock/alerts', method: 'GET', name: 'Low stock alerts' },
    { path: '/inventory/stock-levels/overstock/report', method: 'GET', name: 'Overstock report' },
    { path: '/inventory/stock-levels/valuation', method: 'GET', name: 'Stock valuation' },
    
    // Transactions
    { path: '/transactions/', method: 'GET', name: 'List transactions' },
    { path: '/transactions/reports/daily', method: 'GET', name: 'Daily transaction summary' },
    { path: '/transactions/reports/revenue', method: 'GET', name: 'Revenue report' },
    { path: '/transactions/rentals/overdue', method: 'GET', name: 'Overdue rentals' },
    
    // Rental Returns
    { path: '/rental-returns/', method: 'GET', name: 'List rental returns' },
    { path: '/rental-returns/outstanding', method: 'GET', name: 'Outstanding returns' },
    { path: '/rental-returns/late', method: 'GET', name: 'Late returns' },
    { path: '/rental-returns/needs-inspection', method: 'GET', name: 'Returns needing inspection' },
    { path: '/rental-returns/statistics/status-counts', method: 'GET', name: 'Return status counts' },
    
    // Rental Transactions
    { path: '/rental-transactions/', method: 'GET', name: 'List rental transactions' }
  ];

  console.log(`📊 Testing ${endpoints.length} endpoints...`);
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`[${i + 1}/${endpoints.length}] Testing: ${endpoint.method} ${endpoint.path}`);
    
    const result = await testEndpoint(endpoint.path, endpoint.method);
    
    const testResult = {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      status: result.status,
      success: result.success || [200, 201, 422].includes(result.status),
      message: result.statusText
    };
    
    results.push(testResult);
    
    // Color-coded output
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
    console.log(`${status} | ${result.method.padEnd(4)} | ${result.status.toString().padEnd(3)} | ${result.name}`);
  });
  
  // Failed endpoints
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n🚨 Failed Endpoints:');
    failures.forEach(failure => {
      console.log(`❌ ${failure.method} ${failure.path} - ${failure.status} ${failure.message}`);
    });
  }
  
  console.log('\n🎉 API testing completed!');
  return results;
}

// Run the tests
testAllEndpoints().catch(console.error);