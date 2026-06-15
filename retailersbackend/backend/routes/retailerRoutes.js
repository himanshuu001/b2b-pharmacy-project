const express = require('express');
const { getRetailer, payOutstanding } = require('../controllers/retailerController');

const router = express.Router();

router.get('/', getRetailer);
router.post('/pay', payOutstanding);

module.exports = router;
