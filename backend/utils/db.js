const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'stock_portfolio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;