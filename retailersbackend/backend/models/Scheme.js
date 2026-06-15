const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class Scheme extends JSONModel {}
  Scheme.collectionName = 'schemes';
  module.exports = Scheme;
  return;
}

const schemeSchema = new mongoose.Schema({
  icon: String,
  name: String,
  meta: String,
  saving: String
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
