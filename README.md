# UAE Open Finance Insurance API - Testing Backend

A comprehensive testing backend for the UAE Open Finance Insurance APIs, designed to help developers test their integrations before connecting to production systems.

## 🚀 Features

- ✅ Full implementation of all 7 insurance types (Employment, Health, Home, Life, Motor, Renters, Travel)
- ✅ OAuth2 FAPI-compliant authentication with JWT tokens
- ✅ Consent management system
- ✅ Quote creation, retrieval, and acceptance workflow
- ✅ Policy creation from accepted quotes
- ✅ Realistic data generation with varied test scenarios
- ✅ FAPI header validation (x-fapi-interaction-id, x-fapi-customer-ip-address)
- ✅ Webhook event simulation
- ✅ Interactive Swagger/OpenAPI documentation
- ✅ Docker containerization for easy deployment
- ✅ Comprehensive error handling with proper error codes

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)

## 🛠️ Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd uae-openfinance-test-backend

# Install dependencies
npm install

# Generate RSA key pair for JWT signing
npm run generate-keys

# Copy environment file
cp .env.example .env
```

### 2. Start the Server

**Option A: Local Development**
```bash
npm run dev
```

**Option B: Docker**
```bash
docker-compose up --build
```

The server will start on `http://localhost:3000`

### 3. Access Documentation

- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🔐 Authentication

### Step 1: Get Access Token

```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=test-client-123" \
  -d "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer" \
  -d "client_assertion=dummy-jwt-assertion" \
  -d "scope=openid insurance accounts"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "openid insurance accounts"
}
```

### Step 2: Use Token in Requests

Include the token in the `Authorization` header:
```bash
Authorization: Bearer <access_token>
```

## 📝 API Workflows

### Complete Motor Insurance Flow

#### 1. Create Consent
```bash
curl -X POST http://localhost:3000/insurance-consents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-fapi-interaction-id: $(uuidgen)" \
  -d '{
    "Data": {
      "Permissions": [
        "ReadMotorInsurance",
        "CreateMotorInsuranceQuote"
      ],
      "ExpirationDateTime": "2025-12-31T23:59:59Z"
    }
  }'
```

#### 2. Create Motor Insurance Quote
```bash
curl -X POST http://localhost:3000/motor-insurance-quotes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-fapi-interaction-id: $(uuidgen)" \
  -H "x-fapi-customer-ip-address: 192.168.1.100" \
  -d '{
    "Data": {
      "Customer": {
        "FirstName": "Ahmed",
        "LastName": "Al-Mansouri",
        "Gender": "Male",
        "DateOfBirth": "1990-05-15",
        "MaritalStatus": "Married",
        "MobileNumber": "+971501234567",
        "EmailAddress": "ahmed.almansouri@example.ae",
        "Nationality": "ARE"
      },
      "VehicleDetails": {
        "Make": "Toyota",
        "Model": "Camry",
        "Year": 2022,
        "ChassisNumber": "JTNB11HK0J3012345",
        "EstimatedValue": {
          "Currency": "AED",
          "Amount": "95000.00"
        }
      }
    }
  }'
```

#### 3. Get Quote Details
```bash
curl -X GET http://localhost:3000/motor-insurance-quotes/<quote-id> \
  -H "Authorization: Bearer <token>" \
  -H "x-fapi-interaction-id: $(uuidgen)"
```

#### 4. Accept Quote
```bash
curl -X PATCH http://localhost:3000/motor-insurance-quotes/<quote-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-fapi-interaction-id: $(uuidgen)" \
  -d '{
    "Data": {
      "Status": "Accepted"
    }
  }'
```

#### 5. Create Policy from Quote
```bash
curl -X POST http://localhost:3000/motor-insurance-quotes/<quote-id>/policy \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-fapi-interaction-id: $(uuidgen)"
```

### Health Insurance Example

```bash
curl -X POST http://localhost:3000/health-insurance-quotes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-fapi-interaction-id: $(uuidgen)" \
  -d '{
    "Data": {
      "Customer": {
        "FirstName": "Sara",
        "LastName": "Al-Zaabi",
        "Gender": "Female",
        "DateOfBirth": "1985-03-20",
        "MaritalStatus": "Single",
        "MobileNumber": "+971509876543",
        "EmailAddress": "sara.alzaabi@example.ae",
        "Nationality": "ARE"
      }
    }
  }'
```

### Employment Insurance Example

```bash
curl -X POST http://localhost:3000/employment-insurance-quotes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-fapi-interaction-id: $(uuidgen)" \
  -d '{
    "Data": {
      "Customer": {
        "FirstName": "Mohammed",
        "LastName": "Al-Kaabi",
        "DateOfBirth": "1988-07-12",
        "MobileNumber": "+971501112233",
        "EmailAddress": "mohammed.alkaabi@example.ae",
        "Nationality": "ARE"
      },
      "EmploymentDetails": {
        "EmployerName": "Tech Corporation LLC",
        "JobTitle": "Senior Engineer",
        "Salary": {
          "Currency": "AED",
          "Amount": "25000.00"
        },
        "EmploymentSector": "Private"
      }
    }
  }'
```

## 🧪 Testing Tools

### Admin Endpoints

Generate test tokens without OAuth flow:
```bash
curl -X POST http://localhost:3000/admin/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test-client-123",
    "scope": "openid insurance accounts",
    "expires_in": 3600
  }'
```

Get system statistics:
```bash
curl http://localhost:3000/admin/stats
```

Clear all test data:
```bash
curl -X POST http://localhost:3000/admin/clear-data
```

### Webhook Simulation

Register a webhook:
```bash
curl -X POST http://localhost:3000/webhooks/register \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-tpp.example.ae/webhook",
    "events": ["consent.status.updated", "quote.created"],
    "isActive": true
  }'
```

Simulate webhook event:
```bash
curl -X POST http://localhost:3000/webhooks/simulate-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "consent.status.updated",
    "data": {
      "consentId": "12345",
      "status": "Authorised"
    }
  }'
```

## 📊 All Insurance Types

| Insurance Type | Endpoint | Key Features |
|---------------|----------|--------------|
| Motor | `/motor-insurance-quotes` | Vehicle details, no-claims discount, comprehensive coverage |
| Employment | `/employment-insurance-quotes` | Salary categories, unemployment benefit, end-of-service benefit |
| Health | `/health-insurance-quotes` | Coverage tiers, network providers, maternity & dental |
| Home | `/home-insurance-quotes` | Building & contents cover, property details, liability |
| Life | `/life-insurance-quotes` | Sum assured, term selection, critical illness cover |
| Travel | `/travel-insurance-quotes` | Single/multi-trip, medical expenses, trip cancellation |
| Renters | `/renters-insurance-quotes` | Contents value, liability, temporary accommodation |

## 🔍 Error Handling

The API returns standardized error responses:

```json
{
  "Errors": [{
    "ErrorCode": "UK.OBIE.Field.Invalid",
    "Message": "The field has an invalid value",
    "Path": "Data.Customer.DateOfBirth",
    "Url": "https://openfinance.ae/docs/errors"
  }]
}
```

Common error codes:
- `UK.OBIE.Field.Invalid` - Field validation failed
- `UK.OBIE.Field.Missing` - Required field is missing
- `UK.OBIE.Unauthorized` - Authentication failed
- `UK.OBIE.Forbidden` - Insufficient permissions
- `UK.OBIE.Resource.NotFound` - Resource doesn't exist

## 🏗️ Project Structure

```
uae-openfinance-test-backend/
├── src/
│   ├── server.js                 # Main application entry point
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── fapi-headers.js      # FAPI header validation
│   │   ├── error-handler.js     # Global error handling
│   │   └── request-logger.js    # Request/response logging
│   ├── routes/
│   │   ├── auth.js              # OAuth2 endpoints
│   │   ├── consent.js           # Consent management
│   │   ├── motor-insurance.js   # Motor insurance endpoints
│   │   ├── employment-insurance.js
│   │   ├── health-insurance.js
│   │   ├── home-insurance.js
│   │   ├── life-insurance.js
│   │   ├── travel-insurance.js
│   │   ├── renters-insurance.js
│   │   ├── webhooks.js          # Webhook management
│   │   └── admin.js             # Admin utilities
│   └── services/
│       └── data-generator.js    # Realistic test data generation
├── scripts/
│   └── generate-keys.js         # RSA key generation
├── spec/
│   └── uae-insurance-openapi.yaml
├── keys/                        # RSA keys (generated, not in git)
├── .env.example                 # Environment variables template
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔑 Security Features

- **RS256 JWT Signing**: Asymmetric key cryptography for token security
- **FAPI Header Validation**: RFC4122 UUID validation for interaction IDs
- **Scope-based Authorization**: Fine-grained access control
- **Request Correlation**: Unique correlation IDs for request tracking
- **Rate Limiting**: Configurable rate limits per client

## 🌐 FAPI Compliance

This backend implements:
- Private key JWT client authentication
- Pushed Authorization Request (PAR)
- Authorization code flow with PKCE
- Required FAPI headers validation
- JWT-secured request/response objects

## 📦 Docker Deployment

Build and run with Docker:
```bash
docker-compose up --build
```

The stack includes:
- API server (Port 3000)
- PostgreSQL database (Port 5432)
- Redis cache (Port 6379)

## 🧪 Testing Checklist

Before deploying or using with clients:

- [ ] All 7 insurance types return valid quotes
- [ ] OAuth2 flow generates valid tokens
- [ ] Consent creation and authorization works
- [ ] Quote generation returns varied, realistic data
- [ ] Quote acceptance updates status correctly
- [ ] Policy creation from quote works
- [ ] All error codes return correct format
- [ ] FAPI headers are validated
- [ ] Swagger UI loads and allows testing
- [ ] Docker deployment works

## 📚 Additional Resources

- [UAE Open Finance Standards](https://openfinance.ae)
- [FAPI Security Profile](https://openid.net/specs/openid-financial-api-part-2-1_0.html)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 🤝 Support

For issues or questions:
1. Check the Swagger documentation at `/api-docs`
2. Review the example requests in this README
3. Check server logs for detailed error messages
4. Use the admin endpoints for debugging

## 📄 License

MIT License

## ⚠️ Important Notes

- This is a **TESTING BACKEND** only - not for production use
- Private keys are generated locally - keep them secure
- Data is stored in memory by default - add Redis/PostgreSQL for persistence
- Rate limiting should be configured for production deployments
- CORS is open by default - configure properly for production

## 🔄 Changelog

**Version 1.0.0** (Initial Release)
- Complete implementation of 7 insurance types
- OAuth2 FAPI authentication
- Consent management
- Quote-to-policy workflow
- Webhook simulation
- Docker support
- Comprehensive documentation
