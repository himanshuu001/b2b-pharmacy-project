const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class ExpiryAlert extends JSONModel {}
  ExpiryAlert.collectionName = 'expiry_alerts';
  module.exports = ExpiryAlert;
  return;
}

const expiryAlertSchema = new mongoose.Schema({
  name: String,
  batch: String,
  date: String,
  risk: String,
  qty: String
}, { timestamps: true });

module.exports = mongoose.model('ExpiryAlert', expiryAlertSchema);
