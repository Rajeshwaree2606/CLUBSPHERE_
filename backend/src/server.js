// --------------------------------------------------
// src/server.js — Entry point: connect DB, then start server
// --------------------------------------------------

const dotenv = require("dotenv");

// Load environment variables BEFORE anything else
dotenv.config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

/**
 * start — Connects to PostgreSQL first, then starts Express.
 * If the DB connection fails the process exits with code 1.
 */
const start = async () => {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Start the Express server only after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Health check → http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
