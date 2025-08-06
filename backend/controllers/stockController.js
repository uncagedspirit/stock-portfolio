const Stock = require('../models/Stock.js');

const stockController = {
    getAllStocks: async (req, res) => {
        try {
            const stocks = await Stock.getAll();
            res.json({ success: true, data: stocks });
        } catch (error) {
            console.error('Error fetching stocks:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch stocks' });
        }
    },

    getStockById: async (req, res) => {
        try {
            const stock = await Stock.getById(req.params.id);
            if (!stock) {
                return res.status(404).json({ success: false, message: 'Stock not found' });
            }
            res.json({ success: true, data: stock });
        } catch (error) {
            console.error('Error fetching stock:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch stock' });
        }
    },

    getStockPriceHistory: async (req, res) => {
        try {
            const { id } = req.params;
            const { days = 30 } = req.query;
            const priceHistory = await Stock.getPriceHistory(id, days);
            res.json({ success: true, data: priceHistory });
        } catch (error) {
            console.error('Error fetching price history:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch price history' });
        }
    }
};

module.exports = stockController;