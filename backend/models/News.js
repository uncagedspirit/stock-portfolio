const db = require('../utils/db.js');

class News {
    static async getLatestNews(limit = 20) {
        const [rows] = await db.execute(`
            SELECT * FROM news  
            LIMIT ${Number(limit)}
        `);
        return rows;
    }

    static async getNewsByStock(symbol, limit = 10) {
        const safeLimit = Number(limit); // ensure it's numeric
        const [rows] = await db.execute(`
            SELECT * FROM news
            WHERE stock_symbols = ?
            ORDER BY published_at DESC
            LIMIT ${safeLimit}
        `, [symbol]);
        return rows;
    }    
}

module.exports = News;