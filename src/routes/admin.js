const express = require('express');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Clear all test data
 * POST /admin/clear-data
 */
router.post('/clear-data', (req, res) => {
  // Note: In a real implementation, this would clear all storage
  res.json({
    message: 'All test data cleared',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate test token
 * POST /admin/generate-token
 */
router.post('/generate-token', (req, res) => {
  const { client_id, scope, expires_in } = req.body;

  const token = generateToken({
    client_id: client_id || 'test-client-123',
    scope: scope || 'openid insurance accounts',
    exp: Math.floor(Date.now() / 1000) + (expires_in || 3600)
  });

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: expires_in || 3600,
    scope: scope || 'openid insurance accounts',
    usage: `Authorization: Bearer ${token}`
  });
});

/**
 * Get system statistics
 * GET /admin/stats
 */
router.get('/stats', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Health check with detailed info
 * GET /admin/health-detailed
 */
router.get('/health-detailed', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/auth/token',
      consents: '/insurance-consents',
      employment: '/employment-insurance-quotes',
      health: '/health-insurance-quotes',
      home: '/home-insurance-quotes',
      life: '/life-insurance-quotes',
      motor: '/motor-insurance-quotes',
      renters: '/renters-insurance-quotes',
      travel: '/travel-insurance-quotes',
      webhooks: '/webhooks',
      apiDocs: '/api-docs'
    }
  });
});

/**
 * Test error handling
 * GET /admin/test-error
 */
router.get('/test-error', (req, res) => {
  throw new Error('Test error for error handling middleware');
});

module.exports = router;
