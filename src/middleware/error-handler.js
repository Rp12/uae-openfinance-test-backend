/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const interactionId = req.interactionId || req.headers['x-fapi-interaction-id'];
  
  // Set interaction ID in response if available
  if (interactionId) {
    res.setHeader('x-fapi-interaction-id', interactionId);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Field.Invalid',
        Message: err.message,
        Path: err.path || 'unknown',
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Unauthorized',
        Message: 'Authentication failed',
        Path: 'Authorization',
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  if (err.status === 404) {
    return res.status(404).json({
      Errors: [{
        ErrorCode: 'UK.OBIE.Resource.NotFound',
        Message: 'The requested resource was not found',
        Path: req.path,
        Url: 'https://openfinance.ae/docs/errors'
      }]
    });
  }

  // Default 500 error
  res.status(err.status || 500).json({
    Errors: [{
      ErrorCode: 'UK.OBIE.UnexpectedError',
      Message: err.message || 'An unexpected error occurred',
      Path: req.path,
      Url: 'https://openfinance.ae/docs/errors'
    }]
  });
};

module.exports = errorHandler;
