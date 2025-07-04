// Quick test to verify frontend authentication is working
const axios = require('axios');

const API_URL = 'http://localhost:8000/api/v1';

async function testFrontendAuth() {
  console.log('Testing Frontend Authentication...\n');
  
  try {
    // Test 1: Login
    console.log('1. Testing login endpoint...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@rental.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response structure:', Object.keys(loginResponse.data));
    console.log('User:', loginResponse.data.user.email);
    console.log('Has access_token:', !!loginResponse.data.access_token);
    console.log('Has refresh_token:', !!loginResponse.data.refresh_token);
    
    const { access_token } = loginResponse.data;
    
    // Test 2: Authenticated request
    console.log('\n2. Testing authenticated request...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    console.log('✅ Authenticated request successful!');
    console.log('User data:', meResponse.data.email);
    
    // Test 3: Frontend expects this structure
    console.log('\n3. Verifying frontend compatibility...');
    const hasRequiredFields = 
      loginResponse.data.user &&
      loginResponse.data.access_token &&
      loginResponse.data.refresh_token;
    
    if (hasRequiredFields) {
      console.log('✅ Response structure compatible with frontend!');
    } else {
      console.log('❌ Response structure incompatible with frontend');
    }
    
    console.log('\n✅ All tests passed! Frontend authentication should work.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendAuth();