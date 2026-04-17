-- ============================================
-- ClubSphere — Database Schema
-- Run this file in your PostgreSQL database
-- ============================================

-- Enable UUID extension (optional, we use SERIAL here)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- Users Table ----
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'Member'
                CHECK (role IN ('SuperAdmin', 'ClubAdmin', 'Member', 'Alumni')),
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ---- Clubs Table ----
CREATE TABLE IF NOT EXISTS clubs (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL UNIQUE,
    description TEXT,
    created_by  INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ---- Events Table ----
CREATE TABLE IF NOT EXISTS events (
    id          SERIAL PRIMARY KEY,
    club_id     INTEGER         NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    title       VARCHAR(200)    NOT NULL,
    description TEXT,
    venue       VARCHAR(200),
    event_date  TIMESTAMP       NOT NULL,
    created_by  INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster event lookups by club
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);

-- ---- Club Members Table ----
-- Tracks which users have joined which clubs
CREATE TABLE IF NOT EXISTS club_members (
    id         SERIAL PRIMARY KEY,
    club_id    INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);

-- ---- Event Registrations Table ----
-- Tracks which users have joined/RSVPed to which events
CREATE TABLE IF NOT EXISTS event_registrations (
    id         SERIAL PRIMARY KEY,
    event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

-- ---- Announcements Table ----
CREATE TABLE IF NOT EXISTS announcements (
    id          SERIAL PRIMARY KEY,
    club_id     INTEGER         NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    title       VARCHAR(200)    NOT NULL,
    message     TEXT            NOT NULL,
    created_by  INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster announcement lookups by club
CREATE INDEX IF NOT EXISTS idx_announcements_club_id ON announcements(club_id);

-- ---- Attendance Table ----
CREATE TABLE IF NOT EXISTS attendance (
    id          SERIAL PRIMARY KEY,
    event_id    INTEGER         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      VARCHAR(10)     NOT NULL DEFAULT 'Present'
                CHECK (status IN ('Present', 'Absent', 'Late')),
    marked_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Index for faster attendance lookups
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
