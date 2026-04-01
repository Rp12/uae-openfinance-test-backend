const createInsuranceRouter = require('./insurance-router-factory');
const { generateLifeQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('life', generateLifeQuote);
