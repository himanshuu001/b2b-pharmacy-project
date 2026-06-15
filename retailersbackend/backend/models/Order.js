const mongoose = require('mongoose');
const { JSONModel } = require('./dbMock');

if (process.env.USE_MOCK_DB === 'true') {
  class Order extends JSONModel {}
  Order.collectionName = 'orders';
  module.exports = Order;
  return;
}

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  qty: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  qty: String,
  amount: Number,
  status: String,
  delivery: String,
  priority: String,
  items: [orderItemSchema],
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
