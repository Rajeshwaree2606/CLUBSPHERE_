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
  const client = await pool.connect();
  try {
    // --- 1. Base Tables ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(50) DEFAULT 'Member',
        level       INTEGER DEFAULT 1,
        xp          INTEGER DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clubs (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(255) NOT NULL,
        description  TEXT,
        created_by   INTEGER REFERENCES users(id),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id           SERIAL PRIMARY KEY,
        club_id      INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
        title        VARCHAR(255) NOT NULL,
        description  TEXT,
        venue        VARCHAR(255),
        event_date   DATE NOT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id           SERIAL PRIMARY KEY,
        club_id      INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
        title        VARCHAR(255) NOT NULL,
        message      TEXT NOT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // --- 2. Relationship / Feature Tables ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS club_members (
        id         SERIAL PRIMARY KEY,
        club_id    INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(club_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id           SERIAL PRIMARY KEY,
        club_id      INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        title        VARCHAR(255) NOT NULL,
        amount       DECIMAL(12, 2) NOT NULL,
        type         VARCHAR(50) NOT NULL, 
        description  TEXT,
        created_by   INTEGER NOT NULL REFERENCES users(id),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id          SERIAL PRIMARY KEY,
        event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status      VARCHAR(50) DEFAULT 'Pending',
        marked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);

    console.log(`✅ PostgreSQL connected & Schema Verified → ${process.env.DB_NAME}`);
  } finally {
    client.release(); // return connection back to pool
  }
};

module.exports = { pool, connectDB };
