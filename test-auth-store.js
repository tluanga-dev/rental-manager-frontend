/**
 * Test the auth store functionality directly
 */
const axios = require('axios');

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

const API_URL = 'http://localhost:8000/api/v1';
const TEST_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function printTest(testName, passed, details = '') {
  const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (details) {
    console.log(`  ${colors.yellow}Details: ${details}${colors.reset}`);
  }
}

// Simulate auth store functions
class AuthStore {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.token = null;
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { user, access_token, refresh_token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update store state
      this.user = user;
      this.token = access_token;
      this.isAuthenticated = true;
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  async logout() {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    // Clear local data
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token } = response.data;
      
      // Update token
      localStorage.setItem('access_token', access_token);
      this.token = access_token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return true;
    } catch (error) {
      // If refresh fails, logout
      await this.logout();
      return false;
    }
  }

  loadFromStorage() {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        this.user = JSON.parse(userStr);
        this.token = token;
        this.isAuthenticated = true;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }
    
    return false;
  }

  async getCurrentUser() {
    if (!this.token) return null;

    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      this.user = response.data;
      localStorage.setItem('user', JSON.stringify(this.user));
      return this.user;
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request
          return this.getCurrentUser();
        }
      }
      return null;
    }
  }
}

async function testAuthStore() {
  console.log(`${colors.blue}=== Auth Store Test Suite ===${colors.reset}\n`);
  
  const authStore = new AuthStore();
  
  // Test 1: Initial state
  printTest('Initial State', 
    !authStore.isAuthenticated && !authStore.user && !authStore.token,
    'Store initialized empty'
  );
  
  // Test 2: Login
  const loginResult = await authStore.login(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
  printTest('Login', loginResult.success, 
    loginResult.success ? `User: ${loginResult.user.email}` : loginResult.error
  );
  
  // Test 3: Auth state after login
  printTest('Auth State After Login',
    authStore.isAuthenticated && authStore.user && authStore.token,
    `Authenticated: ${authStore.isAuthenticated}`
  );
  
  // Test 4: LocalStorage persistence
  const hasToken = !!localStorage.getItem('access_token');
  const hasUser = !!localStorage.getItem('user');
  printTest('LocalStorage Persistence', hasToken && hasUser,
    `Token: ${hasToken}, User: ${hasUser}`
  );
  
  // Test 5: Load from storage
  const newStore = new AuthStore();
  const loaded = newStore.loadFromStorage();
  printTest('Load From Storage', loaded && newStore.isAuthenticated,
    `Loaded: ${loaded}`
  );
  
  // Test 6: Get current user
  const currentUser = await authStore.getCurrentUser();
  printTest('Get Current User', !!currentUser,
    currentUser ? `Email: ${currentUser.email}` : 'Failed'
  );
  
  // Test 7: Refresh token
  const refreshed = await authStore.refreshToken();
  printTest('Refresh Token', refreshed, `Success: ${refreshed}`);
  
  // Test 8: API call with auth
  try {
    const response = await axios.get(`${API_URL}/users`);
    printTest('Authenticated API Call', response.status === 200,
      `Status: ${response.status}`
    );
  } catch (error) {
    printTest('Authenticated API Call', false,
      `Error: ${error.response?.status || error.message}`
    );
  }
  
  // Test 9: Logout
  await authStore.logout();
  printTest('Logout',
    !authStore.isAuthenticated && !authStore.user && !authStore.token,
    'Store cleared'
  );
  
  // Test 10: LocalStorage cleared
  const cleared = !localStorage.getItem('access_token') && !localStorage.getItem('user');
  printTest('LocalStorage Cleared', cleared);
  
  // Test 11: Invalid login
  const invalidLogin = await authStore.login('wrong@email.com', 'wrongpass');
  printTest('Invalid Login Rejection', !invalidLogin.success,
    invalidLogin.error || 'No error'
  );
  
  console.log(`\n${colors.blue}=== Test Suite Complete ===${colors.reset}\n`);
}

// Run tests
testAuthStore().catch(console.error);