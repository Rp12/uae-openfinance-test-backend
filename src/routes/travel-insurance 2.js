const createInsuranceRouter = require('./insurance-router-factory');
const { generateTravelQuote } = require('../services/data-generator');

module.exports = createInsuranceRouter('travel', generateTravelQuote);
