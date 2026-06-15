const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class PurchaseSpend extends JSONModel {}
  PurchaseSpend.collectionName = 'purchase_spends';
  module.exports = PurchaseSpend;
  return;
}

const purchaseSpendSchema = new mongoose.Schema({
  month: String,
  purchases: Number,
  payments: Number
}, { timestamps: true });

module.exports = mongoose.model('PurchaseSpend', purchaseSpendSchema);
