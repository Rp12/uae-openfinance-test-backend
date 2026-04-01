const createInsuranceRouter = require('./insurance-router-factory');
const { generateHomeQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('home', generateHomeQuote);
