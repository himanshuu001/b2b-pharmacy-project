const Product = require('../models/Product');

const getProducts = async (req, res, next) => {
  try {
    const search = req.query.search || req.query.q;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const topProducts = await Product.find({ rank: { $exists: true } }).sort({ rank: 1 });
    res.json(topProducts);
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const search = req.query.q || req.query.search;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getTopProducts,
  searchProducts
};
