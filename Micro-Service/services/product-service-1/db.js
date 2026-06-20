const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "advap",
    database: "product_db",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;