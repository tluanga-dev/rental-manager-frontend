module.exports = {
  preset: 'jest-puppeteer',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  setupFiles: ['<rootDir>/tests/setup.js'],
  collectCoverage: false,
  verbose: true,
  bail: false, // Continue running tests even if some fail
  maxWorkers: 1, // Run tests sequentially to avoid conflicts
};