const { v4: uuidv4 } = require('uuid');

/**
 * Request/Response logging middleware with correlation IDs
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  
  // Attach correlation ID to request
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  // Log request
  console.log({
    type: 'REQUEST',
    correlationId,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer ***' : undefined,
      'x-fapi-interaction-id': req.headers['x-fapi-interaction-id'],
      'x-fapi-customer-ip-address': req.headers['x-fapi-customer-ip-address']
    },
    timestamp: new Date().toISOString()
  });

  // Capture original end function
  const originalEnd = res.end;

  // Override end function to log response
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    
    console.log({
      type: 'RESPONSE',
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;
