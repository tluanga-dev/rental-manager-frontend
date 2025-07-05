// Test API responses to debug the structure
const axios = require('axios');

async function testAPIs() {
  const token = localStorage.getItem('accessToken');
  const baseURL = 'http://localhost:8001/api/v1';
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Test SKUs API
    console.log('Testing SKUs API...');
    const skusResponse = await axios.get(`${baseURL}/skus?is_active=true&limit=1000`, config);
    console.log('SKUs response structure:', {
      hasData: !!skusResponse.data,
      dataType: typeof skusResponse.data,
      hasItems: !!skusResponse.data?.items,
      itemsLength: skusResponse.data?.items?.length,
      keys: Object.keys(skusResponse.data || {}),
      sample: skusResponse.data?.items?.[0] || skusResponse.data?.[0]
    });

    // Test Suppliers API
    console.log('\nTesting Suppliers API...');
    const suppliersResponse = await axios.get(`${baseURL}/suppliers/?is_active=true&limit=1000`, config);
    console.log('Suppliers response structure:', {
      hasData: !!suppliersResponse.data,
      dataType: typeof suppliersResponse.data,
      hasItems: !!suppliersResponse.data?.items,
      itemsLength: suppliersResponse.data?.items?.length,
      keys: Object.keys(suppliersResponse.data || {}),
      sample: suppliersResponse.data?.items?.[0] || suppliersResponse.data?.[0]
    });

    // Test Locations API
    console.log('\nTesting Locations API...');
    const locationsResponse = await axios.get(`${baseURL}/locations?is_active=true`, config);
    console.log('Locations response structure:', {
      hasData: !!locationsResponse.data,
      dataType: typeof locationsResponse.data,
      isArray: Array.isArray(locationsResponse.data),
      hasItems: !!locationsResponse.data?.items,
      length: locationsResponse.data?.length || locationsResponse.data?.items?.length,
      keys: Array.isArray(locationsResponse.data) ? 'array' : Object.keys(locationsResponse.data || {}),
      sample: locationsResponse.data?.[0] || locationsResponse.data?.items?.[0]
    });

  } catch (error) {
    console.error('API test error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Note: This needs to be run in the browser console where localStorage is available
console.log('Copy and run this function in the browser console:');
console.log(testAPIs.toString());