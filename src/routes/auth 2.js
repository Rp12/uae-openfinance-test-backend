const express = require('express');
const { generateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/**
 * Mock OAuth2 token endpoint
 * POST /auth/token
 */
router.post('/token', (req, res) => {
  const { grant_type, client_id, client_assertion, client_assertion_type, scope, code } = req.body;

  // Validate grant type
  if (!grant_type) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'grant_type is required'
    });
  }

  // Validate client assertion for private_key_jwt
  if (grant_type === 'client_credentials' || grant_type === 'authorization_code') {
    if (!client_assertion_type || client_assertion_type !== 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer') {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'client_assertion_type must be urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
      });
    }

    if (!client_assertion) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'client_assertion is required'
      });
    }
  }

  // Generate access token
  const accessToken = generateToken({
    client_id: client_id || 'test-client-123',
    scope: scope || 'openid insurance accounts',
    grant_type
  });

  // Generate response based on grant type
  const response = {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: scope || 'openid insurance accounts'
  };

  // Add ID token for authorization_code flow
  if (grant_type === 'authorization_code') {
    response.id_token = generateToken({
      client_id: client_id || 'test-client-123',
      sub: 'test-user-456',
      nonce: uuidv4()
    });
  }

  res.json(response);
});

/**
 * Mock authorization endpoint (for PAR flow)
 * GET /auth/authorize
 */
router.get('/authorize', (req, res) => {
  const { 
    response_type, 
    client_id, 
    redirect_uri, 
    scope, 
    state, 
    nonce,
    code_challenge,
    code_challenge_method
  } = req.query;

  // Validate required parameters
  if (!response_type || !client_id || !redirect_uri) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing required parameters'
    });
  }

  // Generate authorization code
  const authCode = uuidv4();

  // In real implementation, this would redirect to login page
  // For testing, we directly return the authorization code
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.append('code', authCode);
  if (state) redirectUrl.searchParams.append('state', state);

  res.json({
    message: 'Authorization successful',
    authorization_code: authCode,
    redirect_uri: redirectUrl.toString(),
    state
  });
});

/**
 * Mock Pushed Authorization Request (PAR) endpoint
 * POST /auth/par
 */
router.post('/par', (req, res) => {
  const {
    response_type,
    client_id,
    redirect_uri,
    scope,
    state,
    nonce,
    code_challenge,
    code_challenge_method
  } = req.body;

  // Generate request URI
  const requestUri = `urn:ietf:params:oauth:request_uri:${uuidv4()}`;

  res.json({
    request_uri: requestUri,
    expires_in: 90
  });
});

/**
 * JWKS endpoint for token verification
 * GET /auth/.well-known/jwks.json
 */
router.get('/.well-known/jwks.json', (req, res) => {
  const { publicKey } = require('../middleware/auth');
  
  // In production, convert public key to JWK format
  // For testing, return a mock JWKS
  res.json({
    keys: [
      {
        kty: 'RSA',
        use: 'sig',
        kid: 'test-key-1',
        alg: 'RS256',
        n: 'mock-modulus',
        e: 'AQAB'
      }
    ]
  });
});

/**
 * OpenID Configuration endpoint
 * GET /auth/.well-known/openid-configuration
 */
router.get('/.well-known/openid-configuration', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/auth/authorize`,
    token_endpoint: `${baseUrl}/auth/token`,
    jwks_uri: `${baseUrl}/auth/.well-known/jwks.json`,
    pushed_authorization_request_endpoint: `${baseUrl}/auth/par`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'client_credentials'],
    token_endpoint_auth_methods_supported: ['private_key_jwt'],
    scopes_supported: ['openid', 'insurance', 'accounts', 'confirmation-of-payee'],
    claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat']
  });
});

module.exports = router;
