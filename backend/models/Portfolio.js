const db = require('../utils/db.js');

class Portfolio {
    static async getUserHoldings(userId = 1) {
        const [rows] = await db.execute(`
            SELECT h.*, s.symbol, s.company_name, s.current_price,
                   ROUND(h.quantity * s.current_price, 2) as current_value,
                   ROUND((h.quantity * s.current_price) - h.total_invested, 2) as unrealized_pnl,
                   ROUND(((h.quantity * s.current_price) - h.total_invested) / h.total_invested * 100, 2) as pnl_percent
            FROM holdings h
            JOIN stocks s ON h.stock_id = s.id
            WHERE h.user_id = ? AND h.quantity > 0
            ORDER BY current_value DESC
        `, [userId]);
        return rows;
    }

    static async getPortfolioSummary(userId = 1) {
        const holdings = await this.getUserHoldings(userId);
        const [userResult] = await db.execute('SELECT cash_balance FROM users WHERE id = ?', [userId]);
        
        const totalInvested = holdings.reduce((sum, holding) => sum + parseFloat(holding.total_invested), 0);
        const currentValue = holdings.reduce((sum, holding) => sum + parseFloat(holding.current_value), 0);
        const totalPnL = currentValue - totalInvested;
        const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
        const cashBalance = parseFloat(userResult[0]?.cash_balance || 0);
        const totalPortfolioValue = currentValue + cashBalance;

        return {
            totalInvested: totalInvested.toFixed(2),
            currentValue: currentValue.toFixed(2),
            totalPnL: totalPnL.toFixed(2),
            totalPnLPercent: totalPnLPercent.toFixed(2),
            cashBalance: cashBalance.toFixed(2),
            totalPortfolioValue: totalPortfolioValue.toFixed(2),
            holdings: holdings
        };
    }

    static async buyStock(userId, stockId, quantity, price) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Check user's cash balance
            const [userResult] = await connection.execute('SELECT cash_balance FROM users WHERE id = ?', [userId]);
            const cashBalance = parseFloat(userResult[0].cash_balance);
            const totalCost = quantity * price;
            
            if (cashBalance < totalCost) {
                throw new Error('Insufficient cash balance');
            }
            
            // Check if user already has this stock
            const [existingHolding] = await connection.execute(
                'SELECT * FROM holdings WHERE user_id = ? AND stock_id = ?', 
                [userId, stockId]
            );
            
            if (existingHolding.length > 0) {
                // Update existing holding
                const holding = existingHolding[0];
                const newQuantity = holding.quantity + quantity;
                const newTotalInvested = parseFloat(holding.total_invested) + totalCost;
                const newAveragePrice = newTotalInvested / newQuantity;
                
                await connection.execute(`
                    UPDATE holdings 
                    SET quantity = ?, total_invested = ?, average_price = ? 
                    WHERE user_id = ? AND stock_id = ?
                `, [newQuantity, newTotalInvested, newAveragePrice, userId, stockId]);
            } else {
                // Create new holding
                await connection.execute(`
                    INSERT INTO holdings (user_id, stock_id, quantity, average_price, total_invested) 
                    VALUES (?, ?, ?, ?, ?)
                `, [userId, stockId, quantity, price, totalCost]);
            }
            
            // Update user's cash balance
            await connection.execute(
                'UPDATE users SET cash_balance = cash_balance - ? WHERE id = ?', 
                [totalCost, userId]
            );
            
            // Record transaction
            await connection.execute(`
                INSERT INTO transactions (user_id, stock_id, transaction_type, quantity, price_per_share, total_amount) 
                VALUES (?, ?, 'BUY', ?, ?, ?)
            `, [userId, stockId, quantity, price, totalCost]);
            
            await connection.commit();
            return { success: true, message: 'Stock purchased successfully' };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async sellStock(userId, stockId, quantity, price) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Check if user has enough shares
            const [holdingResult] = await connection.execute(
                'SELECT * FROM holdings WHERE user_id = ? AND stock_id = ?', 
                [userId, stockId]
            );
            
            if (holdingResult.length === 0 || holdingResult[0].quantity < quantity) {
                throw new Error('Insufficient shares to sell');
            }
            
            const holding = holdingResult[0];
            const totalSaleValue = quantity * price;
            const newQuantity = holding.quantity - quantity;
            
            if (newQuantity === 0) {
                // Remove holding completely
                await connection.execute('DELETE FROM holdings WHERE user_id = ? AND stock_id = ?', [userId, stockId]);
            } else {
                // Update holding
                const newTotalInvested = (parseFloat(holding.total_invested) * newQuantity) / holding.quantity;
                await connection.execute(`
                    UPDATE holdings 
                    SET quantity = ?, total_invested = ? 
                    WHERE user_id = ? AND stock_id = ?
                `, [newQuantity, newTotalInvested, userId, stockId]);
            }
            
            // Update user's cash balance
            await connection.execute(
                'UPDATE users SET cash_balance = cash_balance + ? WHERE id = ?', 
                [totalSaleValue, userId]
            );
            
            // Record transaction
            await connection.execute(`
                INSERT INTO transactions (user_id, stock_id, transaction_type, quantity, price_per_share, total_amount) 
                VALUES (?, ?, 'SELL', ?, ?, ?)
            `, [userId, stockId, quantity, price, totalSaleValue]);
            
            await connection.commit();
            return { success: true, message: 'Stock sold successfully' };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getTransactionHistory(userId = 1, limit = 50) {
        const [rows] = await db.execute(`
            SELECT t.*, s.symbol, s.company_name 
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.id
            WHERE t.user_id = ?
            ORDER BY t.transaction_date DESC
            LIMIT ?
        `, [userId, limit]);
        return rows;
    }
}

module.exports = Portfolio;