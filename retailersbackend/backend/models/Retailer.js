const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class Retailer extends JSONModel {}
  Retailer.collectionName = 'retailers';
  module.exports = Retailer;
  return;
}

const distributorSchema = new mongoose.Schema({
  name: String,
  location: String,
  phone: String
}, { _id: false });

const retailerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  location: String,
  kycStatus: String,
  kycId: String,
  creditLimit: Number,
  creditUsed: Number,
  walletBalance: Number,
  outstandingDue: Number,
  overdueAmount: Number,
  paidThisMonth: Number,
  escrowBalance: Number,
  distributor: distributorSchema
}, { timestamps: true });

module.exports = mongoose.model('Retailer', retailerSchema);
