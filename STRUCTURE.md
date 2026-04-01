# Project Structure

```
uae-openfinance-test-backend/
├── src/                          # Source code
│   ├── server.js                # Main application entry
│   ├── middleware/              # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── fapi-headers.js     # FAPI header validation
│   │   ├── error-handler.js    # Error handling
│   │   └── request-logger.js   # Request logging
│   ├── routes/                  # API endpoints
│   │   ├── auth.js             # OAuth2 & token endpoints
│   │   ├── consent.js          # Consent management
│   │   ├── motor-insurance.js  # Motor insurance
│   │   ├── employment-insurance.js
│   │   ├── health-insurance.js
│   │   ├── home-insurance.js
│   │   ├── life-insurance.js
│   │   ├── travel-insurance.js
│   │   ├── renters-insurance.js
│   │   ├── insurance-router-factory.js  # Generic router
│   │   ├── webhooks.js         # Webhook management
│   │   └── admin.js            # Admin utilities
│   └── services/                # Business logic
│       └── data-generator.js   # Test data generation
├── tests/                        # Test files
│   └── api.test.js             # API tests
├── scripts/                      # Utility scripts
│   └── generate-keys.js        # RSA key generation
├── spec/                         # API specifications
│   └── uae-insurance-openapi.yaml
├── keys/                         # RSA keys (generated)
│   ├── public-key.pem
│   └── private-key.pem
├── .env.example                  # Environment template
├── .env                          # Environment config (create from example)
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM dependencies
├── Dockerfile                    # Docker image
├── docker-compose.yml            # Docker orchestration
├── jest.config.js               # Jest test config
├── postman-collection.json      # Postman tests
├── start.sh                      # Quick start script
├── README.md                     # Documentation
└── STRUCTURE.md                  # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate RSA keys:**
   ```bash
   npm run generate-keys
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or use the quick start script:
   ```bash
   ./start.sh
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Docker deployment:**
   ```bash
   docker-compose up --build
   ```

## API Documentation

Once running, access:
- Swagger UI: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health
- Admin Stats: http://localhost:3000/admin/stats
