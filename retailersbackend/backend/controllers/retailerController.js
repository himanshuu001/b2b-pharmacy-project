const Retailer = require('../models/Retailer');
const PurchaseSpend = require('../models/PurchaseSpend');

const getRetailer = async (req, res, next) => {
  try {
    const retailer = await Retailer.findOne();
    if (!retailer) {
      res.status(404);
      throw new Error('Retailer profile not found');
    }
    res.json(retailer);
  } catch (error) {
    next(error);
  }
};

const payOutstanding = async (req, res, next) => {
  try {
    const { paymentAmount } = req.body;
    if (!paymentAmount || paymentAmount <= 0) {
      res.status(400);
      throw new Error('Invalid payment amount');
    }

    const retailer = await Retailer.findOne();
    if (!retailer) {
      res.status(404);
      throw new Error('Retailer profile not found');
    }

    if (paymentAmount > retailer.outstandingDue) {
      res.status(400);
      throw new Error('Payment amount exceeds outstanding balance');
    }

    retailer.outstandingDue -= paymentAmount;
    retailer.creditUsed = Math.max(0, retailer.creditUsed - paymentAmount);
    retailer.paidThisMonth = (retailer.paidThisMonth || 0) + paymentAmount;

    await retailer.save();

    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthLabel = monthNames[now.getMonth()];

    let currentTrend = await PurchaseSpend.findOne({ month: currentMonthLabel });
    if (currentTrend) {
      currentTrend.payments += paymentAmount;
      await currentTrend.save();
    } else {
      await PurchaseSpend.create({
        month: currentMonthLabel,
        purchases: 0,
        payments: paymentAmount
      });
    }

    res.json({
      message: 'Payment completed successfully!',
      retailer
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRetailer,
  payOutstanding
};
