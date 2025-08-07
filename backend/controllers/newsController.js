const News = require('../models/News.js');

const newsController = {
    getLatestNews: async (req, res) => {
        try {
            const limit = req.query.limit || 20;
            const news = await News.getLatestNews(limit);
            res.json({ success: true, data: news });
        } catch (error) {
            console.error('Error fetching news:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch news' });
        }
    },

    getNewsByStock: async (req, res) => {
        try {
            const { symbol } = req.params;
            const limit = req.query.limit || 10;
            const news = await News.getNewsByStock(symbol, limit);
            res.json({ success: true, data: news });
        } catch (error) {
            console.error('Error fetching stock news:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch stock news' });
        }
    }
    
};

module.exports = newsController;