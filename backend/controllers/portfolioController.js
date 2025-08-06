const Portfolio = require('../models/Portfolio.js');

const portfolioController = {
    getPortfolio: async (req, res) => {
        try {
            const userId = req.query.userId || 1;
            const portfolio = await Portfolio.getPortfolioSummary(userId);
            res.json({ success: true, data: portfolio });
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch portfolio' });
        }
    },

    getHoldings: async (req, res) => {
        try {
            const userId = req.query.userId || 1;
            const holdings = await Portfolio.getUserHoldings(userId);
            res.json({ success: true, data: holdings });
        } catch (error) {
            console.error('Error fetching holdings:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch holdings' });
        }
    },

    buyStock: async (req, res) => {
        try {
            const { stockId, quantity, price } = req.body;
            const userId = req.body.userId || 1;
            
            if (!stockId || !quantity || !price) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const result = await Portfolio.buyStock(userId, stockId, parseInt(quantity), parseFloat(price));
            res.json(result);
        } catch (error) {
            console.error('Error buying stock:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to buy stock' });
        }
    },

    sellStock: async (req, res) => {
        try {
            const { stockId, quantity, price } = req.body;
            const userId = req.body.userId || 1;
            
            if (!stockId || !quantity || !price) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const result = await Portfolio.sellStock(userId, stockId, parseInt(quantity), parseFloat(price));
            res.json(result);
        } catch (error) {
            console.error('Error selling stock:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to sell stock' });
        }
    },

    getTransactionHistory: async (req, res) => {
        try {
            const userId = req.query.userId || 1;
            const limit = req.query.limit || 50;
            const transactions = await Portfolio.getTransactionHistory(userId, limit);
            res.json({ success: true, data: transactions });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
        }
    }
};

module.exports = portfolioController;