const db = require('../utils/db');

class Stock {
    static async getAll() {
        const [rows] = await db.execute(`
            SELECT s.*, 
                   ROUND(((s.current_price - s.previous_close) / s.previous_close) * 100, 2) as change_percent,
                   ROUND(s.current_price - s.previous_close, 2) as change_amount
            FROM stocks s 
            ORDER BY s.symbol
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM stocks WHERE id = ?', [id]);
        return rows[0];
    }

    static async getBySymbol(symbol) {
        const [rows] = await db.execute('SELECT * FROM stocks WHERE symbol = ?', [symbol]);
        return rows[0];
    }

    static async getPriceHistory(stockId, days = 30) {
        const [rows] = await db.execute(`
            SELECT price, volume, recorded_at 
            FROM stock_prices 
            WHERE stock_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY recorded_at ASC
        `, [stockId, days]);
        return rows;
    }
}

module.exports = Stock;
