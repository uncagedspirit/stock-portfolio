const express = require('express');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

router.get('/', portfolioController.getPortfolio);
router.get('/holdings', portfolioController.getHoldings);
router.get('/transactions', portfolioController.getTransactionHistory);
router.post('/buy', portfolioController.buyStock);
router.post('/sell', portfolioController.sellStock);

module.exports = router;