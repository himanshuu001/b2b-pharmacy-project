const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class AIAlert extends JSONModel {}
  AIAlert.collectionName = 'ai_alerts';
  module.exports = AIAlert;
  return;
}

const aiAlertSchema = new mongoose.Schema({
  type: String,
  icon: String,
  color: String,
  bg: String,
  msg: String
}, { timestamps: true });

module.exports = mongoose.model('AIAlert', aiAlertSchema);
