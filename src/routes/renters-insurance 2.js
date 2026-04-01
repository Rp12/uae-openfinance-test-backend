const createInsuranceRouter = require('./insurance-router-factory');
const { generateRentersQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('renters', generateRentersQuote);
