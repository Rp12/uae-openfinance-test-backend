const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// In-memory storage for webhook subscriptions
const webhookSubscriptions = new Map();

/**
 * Register Webhook
 * POST /webhooks/register
 */
router.post('/register', (req, res) => {
  const { url, events, isActive = true } = req.body;

  if (!url || !events || events.length === 0) {
    return res.status(400).json({
      error: 'url and events are required'
    });
  }

  const webhookId = uuidv4();
  const webhook = {
    webhookId,
    url,
    events,
    isActive,
    createdAt: new Date().toISOString()
  };

  webhookSubscriptions.set(webhookId, webhook);

  res.status(201).json(webhook);
});

/**
 * List Webhooks
 * GET /webhooks
 */
router.get('/', (req, res) => {
  const webhooks = Array.from(webhookSubscriptions.values());
  res.json({
    webhooks,
    count: webhooks.length
  });
});

/**
 * Update Webhook
 * PATCH /webhooks/:webhookId
 */
router.patch('/:webhookId', (req, res) => {
  const { webhookId } = req.params;
  const webhook = webhookSubscriptions.get(webhookId);

  if (!webhook) {
    return res.status(404).json({
      error: 'Webhook not found'
    });
  }

  // Update fields
  if (req.body.url) webhook.url = req.body.url;
  if (req.body.events) webhook.events = req.body.events;
  if (typeof req.body.isActive !== 'undefined') webhook.isActive = req.body.isActive;
  webhook.updatedAt = new Date().toISOString();

  webhookSubscriptions.set(webhookId, webhook);

  res.json(webhook);
});

/**
 * Delete Webhook
 * DELETE /webhooks/:webhookId
 */
router.delete('/:webhookId', (req, res) => {
  const { webhookId } = req.params;

  if (!webhookSubscriptions.has(webhookId)) {
    return res.status(404).json({
      error: 'Webhook not found'
    });
  }

  webhookSubscriptions.delete(webhookId);
  res.status(204).send();
});

/**
 * Simulate sending webhook event
 * POST /webhooks/simulate-event
 */
router.post('/simulate-event', (req, res) => {
  const { eventType, data } = req.body;

  const eventNotification = {
    eventId: uuidv4(),
    eventType: eventType || 'consent.status.updated',
    timestamp: new Date().toISOString(),
    data: data || {
      consentId: uuidv4(),
      status: 'Authorised'
    }
  };

  // Generate self-signed JWT for webhook delivery
  const jwtToken = generateToken({
    event: eventNotification,
    iss: 'https://lfi.example.ae',
    aud: 'https://tpp.example.ae'
  });

  res.json({
    message: 'Webhook event simulated',
    event: eventNotification,
    jwt: jwtToken,
    deliveryNote: 'In production, this would be sent to all registered webhook URLs'
  });
});

module.exports = router;
