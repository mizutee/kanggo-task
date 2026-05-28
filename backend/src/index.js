require('dotenv').config();
const express = require('express');
const { initializeConnection, closeConnection } = require('./database/mysql');
const ResponseHandler = require('./helpers/response');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  return ResponseHandler.success(res, {
    status: 'ok',
    service: 'kanggo-backend',
  });
});

app.use('/api', routes);

async function startServer() {
  try {
    await initializeConnection();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

startServer();
