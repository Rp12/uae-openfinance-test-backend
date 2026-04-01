const createInsuranceRouter = require('./insurance-router-factory');
const { generateMotorQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('motor', generateMotorQuote);
