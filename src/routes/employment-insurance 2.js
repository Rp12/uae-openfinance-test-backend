const createInsuranceRouter = require('./insurance-router-factory');
const { generateEmploymentQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('employment', generateEmploymentQuote);
