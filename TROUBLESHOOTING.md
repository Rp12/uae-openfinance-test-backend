# Troubleshooting Guide

## Error: "Router.use() requires a middleware function but got a Object"

### Cause
This error occurs when Express tries to mount a route that doesn't export a proper router object.

### Solution 1: Verify All Route Files Are Correct

Run this diagnostic script to check your setup:

```bash
node -e "
const routes = [
  './src/routes/auth.js',
  './src/routes/consent.js',
  './src/routes/motor-insurance.js',
  './src/routes/employment-insurance.js',
  './src/routes/health-insurance.js',
  './src/routes/home-insurance.js',
  './src/routes/life-insurance.js',
  './src/routes/travel-insurance.js',
  './src/routes/renters-insurance.js',
  './src/routes/webhooks.js',
  './src/routes/admin.js'
];

routes.forEach(route => {
  try {
    const r = require(route);
    console.log('✅', route, '- Type:', typeof r, r.name || '(router)');
  } catch (e) {
    console.log('❌', route, '- Error:', e.message);
  }
});
"
```

### Solution 2: Quick Fix

The motor-insurance.js file has been updated to use the factory pattern. Make sure you have the latest version.

If issues persist, try this:

1. **Delete node_modules and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Generate new keys:**
```bash
npm run generate-keys
```

3. **Start fresh:**
```bash
npm start
```

## Error: Keys Not Found

### Solution
```bash
npm run generate-keys
```

This will create the RSA key pair needed for JWT signing.

## Error: Port Already in Use

### Solution
Change the port in your `.env` file:

```bash
echo "PORT=3001" >> .env
```

Or kill the process using port 3000:

```bash
# On macOS/Linux
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Error: Cannot Find Module

### Solution
Make sure all dependencies are installed:

```bash
npm install
```

If the error persists, clean install:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Error: OpenAPI Spec Not Found

### Solution
Ensure the OpenAPI spec file exists:

```bash
ls -la spec/uae-insurance-openapi.yaml
```

If missing, the server will still run but won't show the spec in Swagger UI.

## Error: JWT Verification Failed

### Solution
Make sure you're using a valid token:

1. Get a new token from the admin endpoint:
```bash
curl -X POST http://localhost:3000/admin/generate-token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "test-client", "scope": "openid insurance"}'
```

2. Use the returned access_token in your requests

## Error: FAPI Headers Invalid

### Solution
Make sure you include all required FAPI headers:

```bash
-H "x-fapi-interaction-id: $(uuidgen)"
-H "x-fapi-customer-ip-address: 192.168.1.100"
```

The interaction ID must be a valid UUID (RFC4122 format).

## Database Connection Issues

If you're using Docker with PostgreSQL:

```bash
docker-compose down -v
docker-compose up --build
```

This will reset all volumes and start fresh.

## Debugging Tips

### Enable Verbose Logging

Set LOG_LEVEL in .env:
```bash
LOG_LEVEL=debug
```

### Check Server Logs

The server logs all requests with correlation IDs. Check the console output for detailed error messages.

### Test Individual Endpoints

Use the admin health check:
```bash
curl http://localhost:3000/admin/health-detailed
```

### Verify Environment

Check your Node version:
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
```

## Still Having Issues?

1. Check the console logs for specific error messages
2. Verify all files are present in the project directory
3. Try the Docker deployment instead: `docker-compose up --build`
4. Review the README.md for complete setup instructions

## Quick Reset

To completely reset the application:

```bash
# Stop any running instances
pkill -f "node src/server.js"

# Clean everything
rm -rf node_modules package-lock.json keys/

# Reinstall
npm install
npm run generate-keys
cp .env.example .env

# Start fresh
npm start
```
