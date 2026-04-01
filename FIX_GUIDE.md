# Fix for "Router.use() requires a middleware function" Error

## ✅ UPDATED FILES - Problem Fixed!

The following files have been updated to fix the router export issue:

### 1. motor-insurance.js
Changed from manual implementation to factory pattern for consistency:

```javascript
const createInsuranceRouter = require('./insurance-router-factory');
const { generateMotorQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('motor', generateMotorQuote);
```

### 2. auth.js (middleware)
Updated exports to support both default and named exports:

```javascript
module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.generateToken = generateToken;
module.exports.requireScope = requireScope;
```

## 🔧 How to Apply the Fixes

### Option 1: Download Fresh Copy (Recommended)
Download the updated project from the outputs folder - all fixes are already applied.

### Option 2: Manual Fix
If you already have the project, apply these changes:

1. **Update motor-insurance.js:**
```bash
cat > src/routes/motor-insurance.js << 'EOF'
const createInsuranceRouter = require('./insurance-router-factory');
const { generateMotorQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('motor', generateMotorQuote);
EOF
```

2. **Update the exports in middleware/auth.js:**
Add these lines at the end of the file:
```javascript
module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.generateToken = generateToken;
module.exports.requireScope = requireScope;
module.exports.publicKey = publicKey;
module.exports.privateKey = privateKey;
```

## 🧪 Verify the Fix

Run the diagnostic script:
```bash
npm run diagnose
```

This will check all routes and middleware are properly exported.

Expected output:
```
✅ Authentication
✅ Consent Management
✅ Motor Insurance
✅ Employment Insurance
✅ Health Insurance
✅ Home Insurance
✅ Life Insurance
✅ Travel Insurance
✅ Renters Insurance
✅ Webhooks
✅ Admin
```

## 🚀 Start the Server

After applying fixes:

```bash
# Clean install (if needed)
rm -rf node_modules package-lock.json
npm install

# Generate keys (if not already done)
npm run generate-keys

# Run diagnostic
npm run diagnose

# Start server
npm start
```

## 📝 What Was the Problem?

The error occurred because:

1. **Motor insurance route** used a different export pattern than other insurance types
2. **Auth middleware** exports needed to support both default and named exports
3. Express expects middleware functions or routers with specific properties

## ✨ What's Fixed Now?

1. ✅ All insurance routes use consistent factory pattern
2. ✅ Auth middleware exports both default and named exports
3. ✅ All routes return proper Express router objects
4. ✅ Diagnostic script to verify setup before starting

## 🎯 Test It Works

After starting the server:

1. **Check health:**
```bash
curl http://localhost:3000/health
```

2. **Get a token:**
```bash
curl -X POST http://localhost:3000/admin/generate-token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "test", "scope": "openid insurance"}'
```

3. **Create a quote:**
```bash
TOKEN="your-token-here"
curl -X POST http://localhost:3000/motor-insurance-quotes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-fapi-interaction-id: $(uuidgen)" \
  -d '{
    "Data": {
      "Customer": {
        "FirstName": "Test",
        "LastName": "User",
        "DateOfBirth": "1990-01-01",
        "MobileNumber": "+971501234567",
        "EmailAddress": "test@example.ae",
        "Nationality": "ARE"
      },
      "VehicleDetails": {
        "Make": "Toyota",
        "Model": "Camry",
        "Year": 2022,
        "EstimatedValue": {
          "Currency": "AED",
          "Amount": "95000.00"
        }
      }
    }
  }'
```

## 📚 Additional Help

- See `TROUBLESHOOTING.md` for more common issues
- Run `npm run diagnose` to check your setup
- Check `README.md` for full documentation

## 🎉 Success!

If the server starts without errors and you can access:
- http://localhost:3000/health ✅
- http://localhost:3000/api-docs ✅

Then everything is working correctly!
