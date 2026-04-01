module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ],
  testTimeout: 10000
};
