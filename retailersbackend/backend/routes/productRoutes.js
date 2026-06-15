const express = require('express');
const { getProducts, getProductById, getTopProducts, searchProducts } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

module.exports = router;
