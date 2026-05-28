const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kanggo',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
});

async function initializeConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('MySQL connection initialized');
  } finally {
    connection.release();
  }
}

async function closeConnection() {
  await pool.end();
}

module.exports = {
  pool,
  initializeConnection,
  closeConnection,
};
