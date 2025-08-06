const db = require('../utils/db');

class Watchlist {
    static async getUserWatchlist(userId = 1) {
        const [rows] = await db.execute(`
            SELECT w.*, s.symbol, s.company_name, s.current_price, s.previous_close,
                   ROUND(((s.current_price - s.previous_close) / s.previous_close) * 100, 2) as change_percent,
                   ROUND(s.current_price - s.previous_close, 2) as change_amount
            FROM watchlist w
            JOIN stocks s ON w.stock_id = s.id
            WHERE w.user_id = ?
            ORDER BY s.symbol
        `, [userId]);
        return rows;
    }

    static async addToWatchlist(userId, stockId) {
        try {
            await db.execute('INSERT INTO watchlist (user_id, stock_id) VALUES (?, ?)', [userId, stockId]);
            return { success: true, message: 'Stock added to watchlist' };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, message: 'Stock already in watchlist' };
            }
            throw error;
        }
    }

    static async removeFromWatchlist(userId, stockId) {
        const [result] = await db.execute('DELETE FROM watchlist WHERE user_id = ? AND stock_id = ?', [userId, stockId]);
        return { 
            success: result.affectedRows > 0, 
            message: result.affectedRows > 0 ? 'Stock removed from watchlist' : 'Stock not found in watchlist' 
        };
    }
}

module.exports = Watchlist;
