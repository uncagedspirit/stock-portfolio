const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/', stockController.getAllStocks);
router.get('/:id', stockController.getStockById);
router.get('/:id/history', stockController.getStockPriceHistory);

module.exports = router;

