const createInsuranceRouter = require('./insurance-router-factory');
const { generateHealthQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('health', generateHealthQuote);
