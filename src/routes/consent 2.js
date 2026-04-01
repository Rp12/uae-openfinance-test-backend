const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireScope } = require('../middleware/auth');

const router = express.Router();

// In-memory storage
const consents = new Map();

/**
 * Create Insurance Consent
 * POST /insurance-consents
 */
router.post('/', requireScope('insurance'), (req, res) => {
  try {
    const requestData = req.body.Data;

    // Validate required fields
    if (!requestData || !requestData.Permissions || requestData.Permissions.length === 0) {
      return res.status(400).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Field.Missing',
          Message: 'Permissions are required',
          Path: 'Data.Permissions',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    // Generate consent
    const consentId = uuidv4();
    const consent = {
      Data: {
        ConsentId: consentId,
        Status: 'AwaitingAuthorisation',
        CreationDateTime: new Date().toISOString(),
        StatusUpdateDateTime: new Date().toISOString(),
        Permissions: requestData.Permissions,
        ExpirationDateTime: requestData.ExpirationDateTime || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days default
        TransactionFromDateTime: requestData.TransactionFromDateTime,
        TransactionToDateTime: requestData.TransactionToDateTime
      },
      Risk: requestData.Risk || {},
      Links: {
        Self: `/insurance-consents/${consentId}`
      },
      Meta: {}
    };

    // Store consent
    consents.set(consentId, {
      ...consent,
      clientId: req.clientId,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(consent);
  } catch (error) {
    console.error('Error creating consent:', error);
    res.status(500).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.UnexpectedError',
        Message: 'Failed to create consent',
        Path: req.path,
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }
});

/**
 * Get Consent by ID
 * GET /insurance-consents/:consentId
 */
router.get('/:consentId', requireScope('insurance'), (req, res) => {
  const { consentId } = req.params;

  const consent = consents.get(consentId);

  if (!consent) {
    return res.status(404).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Resource.NotFound',
        Message: 'Consent not found',
        Path: req.path,
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  // Check authorization
  if (consent.clientId !== req.clientId) {
    return res.status(403).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Forbidden',
        Message: 'You do not have permission to access this consent',
        Path: req.path,
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  res.json(consent);
});

/**
 * Delete Consent
 * DELETE /insurance-consents/:consentId
 */
router.delete('/:consentId', requireScope('insurance'), (req, res) => {
  const { consentId } = req.params;

  const consent = consents.get(consentId);

  if (!consent) {
    return res.status(404).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Resource.NotFound',
        Message: 'Consent not found',
        Path: req.path,
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  // Check authorization
  if (consent.clientId !== req.clientId) {
    return res.status(403).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Forbidden',
        Message: 'You do not have permission to delete this consent',
        Path: req.path,
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  // Update status to Revoked
  consent.Data.Status = 'Revoked';
  consent.Data.StatusUpdateDateTime = new Date().toISOString();
  consents.set(consentId, consent);

  res.status(204).send();
});

/**
 * Authorize Consent (simulates user authorization)
 * POST /insurance-consents/:consentId/authorize
 */
router.post('/:consentId/authorize', (req, res) => {
  const { consentId } = req.params;

  const consent = consents.get(consentId);

  if (!consent) {
    return res.status(404).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Resource.NotFound',
        Message: 'Consent not found',
        Path: req.path,
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  // Simulate user authorization
  consent.Data.Status = 'Authorised';
  consent.Data.StatusUpdateDateTime = new Date().toISOString();
  consents.set(consentId, consent);

  res.json({
    message: 'Consent authorized successfully',
    consent: consent.Data
  });
});

/**
 * List Consents
 * GET /insurance-consents
 */
router.get('/', requireScope('insurance'), (req, res) => {
  // Filter consents by client
  const clientConsents = Array.from(consents.values())
    .filter(c => c.clientId === req.clientId)
    .map(c => ({
      Data: c.Data,
      Links: c.Links,
      Meta: c.Meta
    }));

  res.json({
    Data: clientConsents,
    Links: {
      Self: req.originalUrl
    },
    Meta: {
      TotalRecords: clientConsents.length
    }
  });
});

module.exports = router;
