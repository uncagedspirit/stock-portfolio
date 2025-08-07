const mysql = require('mysql2/promise');

// import dotenv from 'dotenv';
// dotenv.config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'n3u3da!',
    database: 'stock_portfolio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;