const Order = require('../models/Order');
const Product = require('../models/Product');
const Retailer = require('../models/Retailer');
const PurchaseSpend = require('../models/PurchaseSpend');

const getOrders = async (query) => {
  const filter = {};
  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }
  return Order.find(filter).sort({ createdAt: -1 });
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

const createOrder = async (orderData) => {
  const { items, priority } = orderData;
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('No items in order');
    error.statusCode = 400;
    throw error;
  }

  const retailer = await Retailer.findOne();
  if (!retailer) {
    const error = new Error('Retailer profile not found');
    error.statusCode = 404;
    throw error;
  }

  let totalAmount = 0;
  const formattedItems = [];

  for (const item of items) {
    const product = item.name ? await Product.findOne({ name: item.name }) : null;
    const price = product ? product.price : 100;
    const quantity = Number(item.qty) || 0;
    totalAmount += price * quantity;
    formattedItems.push({
      name: item.name,
      price,
      qty: quantity
    });
  }

  const creditAvailable = retailer.creditLimit - retailer.creditUsed;
  if (totalAmount > creditAvailable + retailer.walletBalance) {
    const error = new Error('Insufficient credit limit or wallet balance');
    error.statusCode = 400;
    throw error;
  }

  let remainingAmount = totalAmount;
  if (retailer.walletBalance >= remainingAmount) {
    retailer.walletBalance -= remainingAmount;
    remainingAmount = 0;
  } else {
    remainingAmount -= retailer.walletBalance;
    retailer.walletBalance = 0;
    retailer.creditUsed += remainingAmount;
    retailer.outstandingDue += remainingAmount;
  }

  await retailer.save();

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ORD-${randomNum}`;

  let deliveryText = 'Standard (2-3 days)';
  if (priority === 'express') deliveryText = 'Today, 6 PM';
  if (priority === 'urgent') deliveryText = 'Urgent (4 hrs)';

  const summaryName = items.map((i) => `${i.name} × ${i.qty}`).join(', ');
  const displayQty = `${items.length} product${items.length > 1 ? 's' : ''}`;

  const newOrder = await Order.create({
    id: orderId,
    name: summaryName.length > 50 ? `${summaryName.substring(0, 47)}...` : summaryName,
    qty: displayQty,
    amount: totalAmount,
    status: 'Pending',
    delivery: deliveryText,
    priority: priority || 'standard',
    items: formattedItems,
    retailer: retailer._id
  });

  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthLabel = monthNames[now.getMonth()];

  let currentTrend = await PurchaseSpend.findOne({ month: currentMonthLabel });
  if (currentTrend) {
    currentTrend.purchases += totalAmount;
    await currentTrend.save();
  } else {
    await PurchaseSpend.create({
      month: currentMonthLabel,
      purchases: totalAmount,
      payments: 0
    });
  }

  return newOrder;
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder
};
