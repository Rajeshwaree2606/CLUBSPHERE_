// --------------------------------------------------
// src/config/db.js — PostgreSQL connection setup
// --------------------------------------------------

const { Pool } = require("pg");

// Create a connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/**
 * connectDB — Tests the database connection.
 * Call this once at startup before starting the server.
 */
const connectDB = async () => {
  const client = await pool.connect(); // throws if connection fails
  try {
    // Ensure supporting tables exist (safe no-ops if already created)
    await client.query(`
      CREATE TABLE IF NOT EXISTS club_members (
        id         SERIAL PRIMARY KEY,
        club_id    INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(club_id, user_id)
      );
    `);

    await client.query("CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);");

    await client.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);

    await client.query("CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);");

    console.log(`✅ PostgreSQL connected  →  ${process.env.DB_NAME}`);
  } finally {
    client.release(); // return connection back to pool
  }
};

module.exports = { pool, connectDB };
