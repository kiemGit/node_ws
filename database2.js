// database.js

const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: '192.168.0.39',       // Replace with your database host
  user: 'hakim',            // Replace with your MySQL username
  password: 'Hakim212526',    // Replace with your MySQL password
  database: 'test',  // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); // Using the promise-based version for cleaner async/await handling
