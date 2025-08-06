const db = require('../utils/db.js');

class News {
    static async getLatestNews(limit = 20) {
        const [rows] = await db.execute(`
            SELECT * FROM news 
            ORDER BY published_at DESC 
            LIMIT ?
        `, [limit]);
        return rows;
    }

    static async getNewsByStock(stockSymbol, limit = 10) {
        const [rows] = await db.execute(`
            SELECT * FROM news 
            WHERE stock_symbols LIKE ? 
            ORDER BY published_at DESC 
            LIMIT ?
        `, [`%${stockSymbol}%`, limit]);
        return rows;
    }
}

module.exports = News;