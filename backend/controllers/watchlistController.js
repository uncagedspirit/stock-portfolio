const Watchlist = require('../models/Watchlist.js');

const watchlistController = {
    getWatchlist: async (req, res) => {
        try {
            const userId = req.query.userId || 1;
            const watchlist = await Watchlist.getUserWatchlist(userId);
            res.json({ success: true, data: watchlist });
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch watchlist' });
        }
    },

    addToWatchlist: async (req, res) => {
        try {
            const { stockId } = req.body;
            const userId = req.body.userId || 1;
            
            if (!stockId) {
                return res.status(400).json({ success: false, message: 'Stock ID is required' });
            }

            const result = await Watchlist.addToWatchlist(userId, stockId);
            res.json(result);
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            res.status(500).json({ success: false, message: 'Failed to add to watchlist' });
        }
    },

    removeFromWatchlist: async (req, res) => {
        try {
            const { stockId } = req.params;
            const userId = req.query.userId || 1;
            
            const result = await Watchlist.removeFromWatchlist(userId, parseInt(stockId));
            res.json(result);
        } catch (error) {
            console.error('Error removing from watchlist:', error);
            res.status(500).json({ success: false, message: 'Failed to remove from watchlist' });
        }
    }
};

module.exports = watchlistController;