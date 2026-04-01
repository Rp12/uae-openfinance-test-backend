#!/usr/bin/env node

/**
 * Diagnostic script to verify all routes are properly exported
 */

console.log('🔍 Checking route exports...\n');

const routes = [
  { path: './src/routes/auth.js', name: 'Authentication' },
  { path: './src/routes/consent.js', name: 'Consent Management' },
  { path: './src/routes/motor-insurance.js', name: 'Motor Insurance' },
  { path: './src/routes/employment-insurance.js', name: 'Employment Insurance' },
  { path: './src/routes/health-insurance.js', name: 'Health Insurance' },
  { path: './src/routes/home-insurance.js', name: 'Home Insurance' },
  { path: './src/routes/life-insurance.js', name: 'Life Insurance' },
  { path: './src/routes/travel-insurance.js', name: 'Travel Insurance' },
  { path: './src/routes/renters-insurance.js', name: 'Renters Insurance' },
  { path: './src/routes/webhooks.js', name: 'Webhooks' },
  { path: './src/routes/admin.js', name: 'Admin' }
];

const middlewares = [
  { path: './src/middleware/auth.js', name: 'Auth Middleware' },
  { path: './src/middleware/fapi-headers.js', name: 'FAPI Headers' },
  { path: './src/middleware/error-handler.js', name: 'Error Handler' },
  { path: './src/middleware/request-logger.js', name: 'Request Logger' }
];

let hasErrors = false;

console.log('📋 Checking Routes:');
console.log('─'.repeat(50));

routes.forEach(({ path, name }) => {
  try {
    const module = require(path);
    const type = typeof module;
    const isFunction = typeof module === 'function';
    const hasStack = module && typeof module.stack === 'function';
    const hasUse = module && typeof module.use === 'function';
    
    if (isFunction || hasStack || hasUse) {
      console.log(`✅ ${name}`);
      console.log(`   Path: ${path}`);
      console.log(`   Type: ${type}, Is Router: ${hasStack || hasUse ? 'Yes' : 'No'}`);
    } else {
      console.log(`❌ ${name}`);
      console.log(`   Path: ${path}`);
      console.log(`   Type: ${type} (Expected: function or router)`);
      console.log(`   Export: ${JSON.stringify(module).substring(0, 100)}`);
      hasErrors = true;
    }
    console.log('');
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Path: ${path}`);
    console.log(`   Error: ${e.message}`);
    console.log('');
    hasErrors = true;
  }
});

console.log('📋 Checking Middleware:');
console.log('─'.repeat(50));

middlewares.forEach(({ path, name }) => {
  try {
    const module = require(path);
    const type = typeof module;
    const isFunction = typeof module === 'function';
    
    console.log(`${isFunction ? '✅' : '⚠️'}  ${name}`);
    console.log(`   Path: ${path}`);
    console.log(`   Type: ${type}`);
    console.log('');
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Path: ${path}`);
    console.log(`   Error: ${e.message}`);
    console.log('');
    hasErrors = true;
  }
});

console.log('─'.repeat(50));

if (hasErrors) {
  console.log('❌ Issues found! Please fix the errors above.');
  console.log('\nCommon fixes:');
  console.log('1. Ensure all route files export with: module.exports = router');
  console.log('2. Check that factory functions return a router');
  console.log('3. Verify all dependencies are installed: npm install');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Routes and middleware are properly configured.');
  console.log('\nYou can now start the server with: npm start');
  process.exit(0);
}
