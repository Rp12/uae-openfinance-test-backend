const request = require('supertest');
const app = require('../src/server');

describe('UAE Open Finance Insurance API Tests', () => {
  let authToken;
  let consentId;
  let quoteId;

  // Test authentication
  describe('Authentication', () => {
    it('should generate access token with client_credentials', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({
          grant_type: 'client_credentials',
          client_id: 'test-client-123',
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: 'dummy-jwt',
          scope: 'openid insurance accounts'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type', 'Bearer');
      expect(response.body).toHaveProperty('expires_in');
      
      authToken = response.body.access_token;
    });

    it('should reject request without grant_type', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({
          client_id: 'test-client-123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test consent management
  describe('Consent Management', () => {
    it('should create a new consent', async () => {
      const response = await request(app)
        .post('/insurance-consents')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012')
        .send({
          Data: {
            Permissions: ['ReadMotorInsurance', 'CreateMotorInsuranceQuote'],
            ExpirationDateTime: '2025-12-31T23:59:59Z'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.Data).toHaveProperty('ConsentId');
      expect(response.body.Data).toHaveProperty('Status', 'AwaitingAuthorisation');
      
      consentId = response.body.Data.ConsentId;
    });

    it('should retrieve consent by ID', async () => {
      const response = await request(app)
        .get(`/insurance-consents/${consentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012');

      expect(response.status).toBe(200);
      expect(response.body.Data.ConsentId).toBe(consentId);
    });

    it('should reject consent creation without permissions', async () => {
      const response = await request(app)
        .post('/insurance-consents')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012')
        .send({
          Data: {}
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('Errors');
    });
  });

  // Test motor insurance quotes
  describe('Motor Insurance Quotes', () => {
    it('should create a motor insurance quote', async () => {
      const response = await request(app)
        .post('/motor-insurance-quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012')
        .set('x-fapi-customer-ip-address', '192.168.1.100')
        .send({
          Data: {
            Customer: {
              FirstName: 'Ahmed',
              LastName: 'Al-Mansouri',
              Gender: 'Male',
              DateOfBirth: '1990-05-15',
              MaritalStatus: 'Married',
              MobileNumber: '+971501234567',
              EmailAddress: 'ahmed@example.ae',
              Nationality: 'ARE'
            },
            VehicleDetails: {
              Make: 'Toyota',
              Model: 'Camry',
              Year: 2022,
              ChassisNumber: 'TEST123456',
              EstimatedValue: {
                Currency: 'AED',
                Amount: '95000.00'
              }
            }
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.Data).toHaveProperty('QuoteId');
      expect(response.body.Data).toHaveProperty('Status', 'Pending');
      expect(response.body.Data).toHaveProperty('Premium');
      expect(response.body.Data.Customer.FirstName).toBe('Ahmed');
      
      quoteId = response.body.Data.QuoteId;
    });

    it('should retrieve quote by ID', async () => {
      const response = await request(app)
        .get(`/motor-insurance-quotes/${quoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012');

      expect(response.status).toBe(200);
      expect(response.body.Data.QuoteId).toBe(quoteId);
    });

    it('should accept a quote', async () => {
      const response = await request(app)
        .patch(`/motor-insurance-quotes/${quoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012')
        .send({
          Data: {
            Status: 'Accepted'
          }
        });

      expect(response.status).toBe(204);
    });

    it('should create policy from accepted quote', async () => {
      const response = await request(app)
        .post(`/motor-insurance-quotes/${quoteId}/policy`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012');

      expect(response.status).toBe(201);
      expect(response.body.Data).toHaveProperty('PolicyId');
      expect(response.body.Data).toHaveProperty('PolicyNumber');
      expect(response.body.Data).toHaveProperty('Status', 'Active');
    });

    it('should reject quote creation without customer data', async () => {
      const response = await request(app)
        .post('/motor-insurance-quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012')
        .send({
          Data: {}
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('Errors');
    });
  });

  // Test health insurance quotes
  describe('Health Insurance Quotes', () => {
    it('should create a health insurance quote', async () => {
      const response = await request(app)
        .post('/health-insurance-quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012')
        .send({
          Data: {
            Customer: {
              FirstName: 'Sara',
              LastName: 'Al-Zaabi',
              Gender: 'Female',
              DateOfBirth: '1985-03-20',
              MaritalStatus: 'Single',
              MobileNumber: '+971509876543',
              EmailAddress: 'sara@example.ae',
              Nationality: 'ARE'
            }
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.Data).toHaveProperty('QuoteId');
      expect(response.body.Data).toHaveProperty('Coverage');
      expect(response.body.Data.Coverage).toHaveProperty('Tier');
    });
  });

  // Test error handling
  describe('Error Handling', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/motor-insurance-quotes');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('Errors');
    });

    it('should return 404 for non-existent quote', async () => {
      const response = await request(app)
        .get('/motor-insurance-quotes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', '12345678-1234-1234-1234-123456789012');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('Errors');
    });

    it('should validate FAPI interaction ID format', async () => {
      const response = await request(app)
        .get('/insurance-consents')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-fapi-interaction-id', 'invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('Errors');
    });
  });

  // Test admin endpoints
  describe('Admin Endpoints', () => {
    it('should get system statistics', async () => {
      const response = await request(app)
        .get('/admin/stats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });

    it('should generate test token', async () => {
      const response = await request(app)
        .post('/admin/generate-token')
        .send({
          client_id: 'test-client',
          scope: 'openid insurance'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
    });
  });

  // Test health check
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });
});
