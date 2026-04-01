require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Import middleware
const authMiddleware = require('./middleware/auth');
const fapiHeaderMiddleware = require('./middleware/fapi-headers');
const errorHandler = require('./middleware/error-handler');
const requestLogger = require('./middleware/request-logger');

// Import routes
const authRoutes = require('./routes/auth');
const consentRoutes = require('./routes/consent');
const employmentInsuranceRoutes = require('./routes/employment-insurance');
const healthInsuranceRoutes = require('./routes/health-insurance');
const homeInsuranceRoutes = require('./routes/home-insurance');
const lifeInsuranceRoutes = require('./routes/life-insurance');
const motorInsuranceRoutes = require('./routes/motor-insurance');
const rentersInsuranceRoutes = require('./routes/renters-insurance');
const travelInsuranceRoutes = require('./routes/travel-insurance');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Load OpenAPI specification
const openapiPath = path.join(__dirname, '../spec/uae-insurance-openapi.yaml');
let openapiSpec;
try {
  const fileContents = fs.readFileSync(openapiPath, 'utf8');
  openapiSpec = YAML.load(fileContents);
} catch (e) {
  console.warn('Could not load OpenAPI spec:', e.message);
  openapiSpec = { info: { title: 'UAE Insurance API', version: '1.0.0' } };
}

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes (no auth required)
app.use('/auth', authRoutes);

// Apply FAPI headers middleware to all protected routes
app.use(fapiHeaderMiddleware);

// Protected routes (require authentication)
app.use('/insurance-consents', authMiddleware, consentRoutes);
app.use('/employment-insurance-quotes', authMiddleware, employmentInsuranceRoutes);
app.use('/health-insurance-quotes', authMiddleware, healthInsuranceRoutes);
app.use('/home-insurance-quotes', authMiddleware, homeInsuranceRoutes);
app.use('/life-insurance-quotes', authMiddleware, lifeInsuranceRoutes);
app.use('/motor-insurance-quotes', authMiddleware, motorInsuranceRoutes);
app.use('/renters-insurance-quotes', authMiddleware, rentersInsuranceRoutes);
app.use('/travel-insurance-quotes', authMiddleware, travelInsuranceRoutes);

// Webhook routes
app.use('/webhooks', webhookRoutes);

// Admin routes (for testing/debugging)
app.use('/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'UAE Open Finance Insurance API Testing Backend',
    documentation: '/api-docs',
    health: '/health',
    version: '1.0.0'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UAE Open Finance Test Backend running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
