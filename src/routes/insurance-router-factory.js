const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireScope } = require('../middleware/auth');

/**
 * Factory function to create insurance routes for different types
 * @param {string} insuranceType - Type of insurance (employment, health, home, life, travel, renters)
 * @param {function} quoteGenerator - Function to generate quotes for this insurance type
 */
function createInsuranceRouter(insuranceType, quoteGenerator) {
  const router = express.Router();
  
  // In-memory storage (use Redis or database in production)
  const quotes = new Map();
  const policies = new Map();

  /**
   * Create Insurance Quote
   * POST /{insurance-type}-insurance-quotes
   */
  router.post('/', requireScope('insurance'), (req, res) => {
    try {
      const requestData = req.body.Data;

      // Validate required fields
      if (!requestData || !requestData.Customer) {
        return res.status(400).json({
          Errors: [{
            ErrorCode: 'UK.OBIE.Field.Missing',
            Message: 'Customer data is required',
            Path: 'Data.Customer',
            Url: 'https://openfinance.ae/docs/errors'
          }]
        });
      }

      // Generate quote using provided generator
      const quote = quoteGenerator(requestData);
      const quoteId = quote.Data.QuoteId;

      // Store quote
      quotes.set(quoteId, {
        ...quote,
        clientId: req.clientId,
        createdAt: new Date().toISOString()
      });

      res.status(201).json(quote);
    } catch (error) {
      console.error(`Error creating ${insuranceType} quote:`, error);
      res.status(500).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.UnexpectedError',
          Message: 'Failed to create quote',
          Path: req.path,
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }
  });

  /**
   * Get Insurance Quote by ID
   * GET /{insurance-type}-insurance-quotes/:quoteId
   */
  router.get('/:quoteId', requireScope('insurance'), (req, res) => {
    const { quoteId } = req.params;
    const quote = quotes.get(quoteId);

    if (!quote) {
      return res.status(404).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Resource.NotFound',
          Message: 'Quote not found',
          Path: req.path,
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    if (quote.clientId !== req.clientId) {
      return res.status(403).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Forbidden',
          Message: 'You do not have permission to access this quote',
          Path: req.path,
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    res.json(quote);
  });

  /**
   * Accept/Reject Insurance Quote
   * PATCH /{insurance-type}-insurance-quotes/:quoteId
   */
  router.patch('/:quoteId', requireScope('insurance'), (req, res) => {
    const { quoteId } = req.params;
    const { Data } = req.body;

    const quote = quotes.get(quoteId);

    if (!quote) {
      return res.status(404).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Resource.NotFound',
          Message: 'Quote not found',
          Path: req.path,
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    if (quote.clientId !== req.clientId) {
      return res.status(403).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Forbidden',
          Message: 'You do not have permission to update this quote',
          Path: req.path,
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    if (!Data || !Data.Status) {
      return res.status(400).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Field.Missing',
          Message: 'Status is required',
          Path: 'Data.Status',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    const validStatuses = ['Accepted', 'Rejected'];
    if (!validStatuses.includes(Data.Status)) {
      return res.status(400).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Field.Invalid',
          Message: `Status must be one of: ${validStatuses.join(', ')}`,
          Path: 'Data.Status',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    quote.Data.Status = Data.Status;
    quote.Data.StatusUpdateDateTime = new Date().toISOString();
    quotes.set(quoteId, quote);

    res.status(204).send();
  });

  /**
   * Create Policy from Quote
   * POST /{insurance-type}-insurance-quotes/:quoteId/policy
   */
  router.post('/:quoteId/policy', requireScope('insurance'), (req, res) => {
    const { quoteId } = req.params;
    const quote = quotes.get(quoteId);

    if (!quote) {
      return res.status(404).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Resource.NotFound',
          Message: 'Quote not found',
          Path: req.path,
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    if (quote.clientId !== req.clientId) {
      return res.status(403).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Forbidden',
          Message: 'You do not have permission to create policy from this quote',
          Path: req.path,
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    if (quote.Data.Status !== 'Accepted') {
      return res.status(400).json({
        Errors: [{
          ErrorCode: 'UK.OBIE.Field.Invalid',
          Message: 'Quote must be accepted before creating policy',
          Path: 'Data.Status',
          Url: 'https://openfinance.ae/docs/errors'
        }]
      });
    }

    const policyId = uuidv4();
    const policyPrefix = insuranceType.substring(0, 3).toUpperCase();
    const policy = {
      Data: {
        PolicyId: policyId,
        PolicyNumber: `${policyPrefix}-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
        QuoteId: quoteId,
        Status: 'Active',
        IssueDate: new Date().toISOString(),
        EffectiveDate: new Date().toISOString(),
        ExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        ...quote.Data
      },
      Links: {
        Self: `/${insuranceType}-insurance-policies/${policyId}`
      },
      Meta: {}
    };

    policies.set(policyId, {
      ...policy,
      clientId: req.clientId,
      createdAt: new Date().toISOString()
    });

    quote.Data.Status = 'Converted';
    quote.Data.PolicyId = policyId;
    quotes.set(quoteId, quote);

    res.status(201).json(policy);
  });

  /**
   * List Insurance Quotes
   * GET /{insurance-type}-insurance-quotes
   */
  router.get('/', requireScope('insurance'), (req, res) => {
    const clientQuotes = Array.from(quotes.values())
      .filter(q => q.clientId === req.clientId)
      .map(q => ({
        Data: q.Data,
        Links: q.Links,
        Meta: q.Meta
      }));

    res.json({
      Data: clientQuotes,
      Links: {
        Self: req.originalUrl
      },
      Meta: {
        TotalRecords: clientQuotes.length
      }
    });
  });

  return router;
}

module.exports = createInsuranceRouter;
