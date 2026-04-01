const { v4: uuidv4, validate: uuidValidate } = require('uuid');

/**
 * Middleware to validate and handle FAPI-required headers
 */
const fapiHeaderMiddleware = (req, res, next) => {
  // Generate or validate x-fapi-interaction-id
  let interactionId = req.headers['x-fapi-interaction-id'];
  
  if (!interactionId) {
    // Generate a new one if not provided
    interactionId = uuidv4();
  } else if (!uuidValidate(interactionId)) {
    return res.status(400).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Field.Invalid',
        Message: 'x-fapi-interaction-id must be a valid RFC4122 UUID',
        Path: 'x-fapi-interaction-id',
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  // Attach interaction ID to response header
  res.setHeader('x-fapi-interaction-id', interactionId);
  req.interactionId = interactionId;

  // Validate x-fapi-customer-ip-address if present
  const customerIp = req.headers['x-fapi-customer-ip-address'];
  if (customerIp && !isValidIp(customerIp)) {
    return res.status(400).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Field.Invalid',
        Message: 'x-fapi-customer-ip-address must be a valid IP address',
        Path: 'x-fapi-customer-ip-address',
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  // Store FAPI headers in request for logging
  req.fapiHeaders = {
    interactionId,
    customerIp: customerIp || req.ip,
    customerUserAgent: req.headers['x-customer-user-agent'],
    authDate: req.headers['x-fapi-auth-date']
  };

  next();
};

/**
 * Validate IP address format
 */
function isValidIp(ip) {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i;
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
  }
  
  return ipv6Regex.test(ip);
}

module.exports = fapiHeaderMiddleware;
