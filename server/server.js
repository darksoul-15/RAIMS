// server/server.js
const mongoose   = require('mongoose');
const { connectDB } = require('./config/db');
const runSeed    = require('./seed');
const app        = require('./app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await runSeed();

  const server = app.listen(PORT, () =>
    console.log(`RAIMS server [${process.env.NODE_ENV || 'development'}] running on port ${PORT}`)
  );

  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => {
      mongoose.connection.close().then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
};

start();
