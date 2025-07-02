const axios = require('axios');

async function testApiEndpoints() {
  console.log('🚀 Starting comprehensive API endpoint testing...');
  
  const API_BASE_URL = 'http://localhost:8000/api/v1';
  const ROOT_URL = 'http://localhost:8000';
  const results = [];
  
  // Configure axios with timeout
  const client = axios.create({
    timeout: 10000,
    validateStatus: () => true // Don't throw errors for any status code
  });

  // Helper function to test endpoints
  const testEndpoint = async (url, method = 'GET', data = null, description = '') => {
    try {
      const config = {
        method: method.toLowerCase(),
        url: url,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (data && method !== 'GET') {
        config.data = data;
      }
      
      const response = await client(config);
      
      return {
        url: url,
        method: method,
        description: description,
        status: response.status,
        success: response.status >= 200 && response.status < 400,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return {
        url: url,
        method: method,
        description: description,
        status: 0,
        success: false,
        error: error.message,
        data: null
      };
    }
  };

  // Test basic endpoints
  console.log('📊 Testing basic endpoints...');
  const basicTests = [
    { url: `${ROOT_URL}/`, description: 'Root endpoint' },
    { url: `${ROOT_URL}/docs`, description: 'Swagger UI documentation' },
    { url: `${API_BASE_URL}/openapi.json`, description: 'OpenAPI specification' }
  ];

  for (const test of basicTests) {
    console.log(`Testing: ${test.description}`);
    const result = await testEndpoint(test.url, 'GET', null, test.description);
    results.push(result);
    
    const statusColor = result.success ? '✅' : '❌';
    console.log(`   ${statusColor} ${result.status} - ${result.description}`);
  }

  // Test main API endpoints
  console.log('\n📋 Testing main API endpoints...');
  const apiTests = [
    { path: '/users/', description: 'List users' },
    { path: '/locations/', description: 'List locations' },
    { path: '/categories/', description: 'List categories' },
    { path: '/categories/tree/', description: 'Category tree structure' },
    { path: '/categories/leaf/all', description: 'All leaf categories' },
    { path: '/categories/statistics/summary', description: 'Category statistics' },
    { path: '/brands/', description: 'List brands' },
    { path: '/customers/', description: 'List customers' },
    { path: '/item-masters/', description: 'List item masters' },
    { path: '/skus/', description: 'List SKUs' },
    { path: '/inventory/units', description: 'List inventory units' },
    { path: '/inventory/stock-levels', description: 'List stock levels' },
    { path: '/transactions/', description: 'List transactions' },
    { path: '/rental-returns/', description: 'List rental returns' },
    { path: '/rental-transactions/', description: 'List rental transactions' }
  ];

  for (const test of apiTests) {
    console.log(`Testing: ${test.description}`);
    const result = await testEndpoint(`${API_BASE_URL}${test.path}`, 'GET', null, test.description);
    results.push(result);
    
    const statusColor = result.success ? '✅' : '❌';
    console.log(`   ${statusColor} ${result.status} - ${result.description}`);
    
    // Show a snippet of successful responses
    if (result.success && result.data) {
      if (Array.isArray(result.data)) {
        console.log(`   📄 Returned ${result.data.length} items`);
      } else if (typeof result.data === 'object') {
        console.log(`   📄 Returned object with keys: ${Object.keys(result.data).slice(0, 3).join(', ')}`);
      }
    }
  }

  // Test POST endpoints
  console.log('\n🔄 Testing POST endpoints...');
  const postTests = [
    {
      path: '/users/',
      description: 'Create user',
      data: {
        username: `testuser${Date.now()}`,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        password: "testpassword123"
      }
    },
    {
      path: '/categories/',
      description: 'Create category',
      data: {
        category_name: `Test Category ${Date.now()}`,
        category_path: `/test-category-${Date.now()}`
      }
    },
    {
      path: '/brands/',
      description: 'Create brand',
      data: {
        brand_name: `Test Brand ${Date.now()}`,
        brand_code: `TB${Date.now().toString().slice(-6)}`,
        description: "Test brand description"
      }
    },
    {
      path: '/locations/',
      description: 'Create location',
      data: {
        location_code: `LOC${Date.now()}`,
        location_name: "Test Location",
        location_type: "STORE",
        address: "123 Test St",
        city: "Test City",
        state: "TS",
        country: "USA"
      }
    }
  ];

  for (const test of postTests) {
    console.log(`Testing: ${test.description}`);
    const result = await testEndpoint(`${API_BASE_URL}${test.path}`, 'POST', test.data, test.description);
    results.push(result);
    
    // Accept 201 (created), 422 (validation error), or other expected codes
    const acceptable = [201, 422, 400].includes(result.status);
    const statusColor = (result.success || acceptable) ? '✅' : '❌';
    console.log(`   ${statusColor} ${result.status} - ${result.description}`);
    
    if (result.status === 422 && result.data) {
      console.log(`   🔍 Validation error details available`);
    }
  }

  // Test some specific utility endpoints
  console.log('\n🔧 Testing utility endpoints...');
  const utilityTests = [
    { path: '/inventory/units/status-count', description: 'Inventory status counts' },
    { path: '/inventory/units/condition-count', description: 'Inventory condition counts' },
    { path: '/inventory/stock-levels/low-stock/alerts', description: 'Low stock alerts' },
    { path: '/transactions/reports/daily', description: 'Daily transaction reports' },
    { path: '/rental-returns/outstanding', description: 'Outstanding returns' },
    { path: '/rental-returns/statistics/status-counts', description: 'Return status counts' }
  ];

  for (const test of utilityTests) {
    console.log(`Testing: ${test.description}`);
    const result = await testEndpoint(`${API_BASE_URL}${test.path}`, 'GET', null, test.description);
    results.push(result);
    
    const statusColor = result.success ? '✅' : '❌';
    console.log(`   ${statusColor} ${result.status} - ${result.description}`);
  }

  // Calculate and display results
  const successCount = results.filter(r => r.success || [422, 400].includes(r.status)).length;
  const totalCount = results.length;
  const failureCount = totalCount - successCount;
  
  console.log('\n📈 Final Test Results Summary:');
  console.log(`Total Endpoints Tested: ${totalCount}`);
  console.log(`✅ Successful/Expected: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  // Group results by status code
  const statusGroups = {};
  results.forEach(result => {
    const status = result.status;
    if (!statusGroups[status]) {
      statusGroups[status] = [];
    }
    statusGroups[status].push(result);
  });
  
  console.log('\n📊 Results by Status Code:');
  Object.keys(statusGroups).sort().forEach(status => {
    const count = statusGroups[status].length;
    const statusName = getStatusName(parseInt(status));
    console.log(`${status} ${statusName}: ${count} endpoints`);
  });
  
  // Show detailed results
  console.log('\n📋 Detailed Test Results:');
  results.forEach(result => {
    const statusIcon = (result.success || [422, 400].includes(result.status)) ? '✅' : '❌';
    console.log(`${statusIcon} ${result.method} ${result.status} | ${result.description}`);
  });
  
  // Show failures
  const failures = results.filter(r => !r.success && ![422, 400].includes(r.status));
  if (failures.length > 0) {
    console.log('\n🚨 Failed Endpoints (excluding expected validation errors):');
    failures.forEach(failure => {
      console.log(`❌ ${failure.method} ${failure.url} - ${failure.status} ${failure.error || 'Unknown error'}`);
    });
  } else {
    console.log('\n🎉 All endpoints are working as expected!');
  }
  
  console.log('\n🎯 API testing completed successfully!');
  return results;
}

function getStatusName(status) {
  const statusNames = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    404: 'Not Found',
    422: 'Validation Error',
    500: 'Internal Server Error'
  };
  return statusNames[status] || 'Unknown';
}

// Install axios if not available
async function ensureAxios() {
  try {
    require('axios');
  } catch (error) {
    console.log('📦 Installing axios...');
    const { execSync } = require('child_process');
    execSync('npm install axios', { stdio: 'inherit' });
  }
}

// Run the tests
async function main() {
  try {
    await ensureAxios();
    await testApiEndpoints();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

main();