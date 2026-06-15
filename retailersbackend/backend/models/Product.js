const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class Product extends JSONModel {}
  Product.collectionName = 'products';
  module.exports = Product;
  return;
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  unit: String,
  category: String,
  rank: Number,
  qty: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
