const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load keys (generate these using the generate-keys script)
let publicKey, privateKey;

try {
  publicKey = fs.readFileSync(path.join(__dirname, '../../keys/public-key.pem'), 'utf8');
  privateKey = fs.readFileSync(path.join(__dirname, '../../keys/private-key.pem'), 'utf8');
} catch (error) {
  console.warn('Keys not found. Using default test keys. Run "npm run generate-keys" in production.');
  // Fallback to environment variables or generate temporary keys
  publicKey = process.env.PUBLIC_KEY || '';
  privateKey = process.env.PRIVATE_KEY || '';
}

/**
 * Middleware to validate JWT Bearer token
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Unauthorized',
          Message: 'Authorization header missing or invalid',
          Path: 'Authorization',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });

    // Attach decoded token to request
    req.user = decoded;
    req.clientId = decoded.client_id;
    req.scopes = decoded.scope ? decoded.scope.split(' ') : [];

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Unauthorized',
          Message: 'Token has expired',
          Path: 'Authorization',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Unauthorized',
          Message: 'Invalid token',
          Path: 'Authorization',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    return res.status(401).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Unauthorized',
        Message: 'Authentication failed',
        Path: 'Authorization',
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }
};

/**
 * Generate a JWT token for testing
 */
const generateToken = (payload = {}) => {
  const defaultPayload = {
    iss: 'https://test-tpp.example.ae',
    aud: 'https://test-lfi.example.ae',
    client_id: payload.client_id || 'test-tpp-client-123',
    scope: payload.scope || 'openid insurance accounts',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000)
  };

  const tokenPayload = { ...defaultPayload, ...payload };

  return jwt.sign(tokenPayload, privateKey, {
    algorithm: 'RS256'
  });
};

/**
 * Verify scope access
 */
const requireScope = (...requiredScopes) => {
  return (req, res, next) => {
    const userScopes = req.scopes || [];
    
    const hasRequiredScope = requiredScopes.some(scope => 
      userScopes.includes(scope)
    );

    if (!hasRequiredScope) {
      return res.status(403).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Forbidden',
          Message: `Required scope not present. Required: ${requiredScopes.join(' or ')}`,
          Path: 'Authorization',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    next();
  };
};

// Export as default for use in server.js
module.exports = authMiddleware;

// Also export as named exports for flexibility
module.exports.authMiddleware = authMiddleware;
module.exports.generateToken = generateToken;
module.exports.requireScope = requireScope;
module.exports.publicKey = publicKey;
module.exports.privateKey = privateKey;
