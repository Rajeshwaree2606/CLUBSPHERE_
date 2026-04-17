// --------------------------------------------------
// src/controllers/eventController.js — Event operations
// --------------------------------------------------

const { pool } = require("../config/db");

// ========================
//  CREATE EVENT — POST /api/events
//  SuperAdmin & ClubAdmin only
// ========================
const createEvent = async (req, res) => {
  try {
    const { club_id, title, description, venue, event_date } = req.body;

    // --- Input validation ---
    if (!club_id || !title || !event_date) {
      return res.status(400).json({
        success: false,
        message: "club_id, title, and event_date are required",
      });
    }

    // --- Check if club exists ---
    const clubCheck = await pool.query(
      "SELECT id FROM clubs WHERE id = $1",
      [club_id]
    );

    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    // --- Insert event ---
    const result = await pool.query(
      `INSERT INTO events (club_id, title, description, venue, event_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [club_id, title, description || null, venue || null, event_date, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Create Event Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating event",
    });
  }
};

// ========================
//  GET ALL EVENTS — GET /api/events
//  Any authenticated user
//  Includes club_id + joined for the current user
// ========================
const getEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.club_id, e.title, e.description, e.venue, e.event_date, e.created_at,
              c.name AS club_name,
              u.name AS created_by_name,
              (er_me.user_id IS NOT NULL) AS joined
       FROM events e
       LEFT JOIN clubs c ON e.club_id = c.id
       LEFT JOIN users u ON e.created_by = u.id
       LEFT JOIN event_registrations er_me
         ON er_me.event_id = e.id AND er_me.user_id = $1
       ORDER BY e.event_date DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get Events Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
};

// ========================
//  GET EVENT BY ID — GET /api/events/:id
//  Any authenticated user
//  Includes joined for the current user
// ========================
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.id, e.club_id, e.title, e.description, e.venue, e.event_date, e.created_at,
              c.name AS club_name,
              u.name AS created_by_name,
              (er_me.user_id IS NOT NULL) AS joined
       FROM events e
       LEFT JOIN clubs c ON e.club_id = c.id
       LEFT JOIN users u ON e.created_by = u.id
       LEFT JOIN event_registrations er_me
         ON er_me.event_id = e.id AND er_me.user_id = $2
       WHERE e.id = $1`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Get Event By ID Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching event",
    });
  }
};

// ========================
//  JOIN EVENT — POST /api/events/:eventId/join
//  Any authenticated user
// ========================
const joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // --- Check if event exists ---
    const eventCheck = await pool.query(
      "SELECT id, club_id, title, description, venue, event_date, created_at FROM events WHERE id = $1",
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // --- Insert registration (idempotent) ---
    await pool.query(
      `INSERT INTO event_registrations (event_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (event_id, user_id) DO NOTHING`,
      [eventId, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Joined event successfully",
      data: {
        ...eventCheck.rows[0],
        joined: true,
      },
    });
  } catch (error) {
    console.error("❌ Join Event Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while joining event",
    });
  }
};

// ========================
//  UPDATE EVENT — PUT /api/events/:id
//  SuperAdmin & ClubAdmin only
// ========================
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, venue, event_date } = req.body;

    // --- Check if event exists ---
    const eventCheck = await pool.query(
      "SELECT id FROM events WHERE id = $1",
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // --- Update event ---
    const result = await pool.query(
      `UPDATE events
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           venue       = COALESCE($3, venue),
           event_date  = COALESCE($4, event_date)
       WHERE id = $5
       RETURNING *`,
      [title, description, venue, event_date, id]
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Update Event Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating event",
    });
  }
};

// ========================
//  DELETE EVENT — DELETE /api/events/:id
//  SuperAdmin & ClubAdmin only
// ========================
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // --- Check if event exists ---
    const eventCheck = await pool.query(
      "SELECT id FROM events WHERE id = $1",
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // --- Delete event ---
    await pool.query("DELETE FROM events WHERE id = $1", [id]);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Event Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting event",
    });
  }
};

module.exports = { createEvent, getEvents, getEventById, joinEvent, updateEvent, deleteEvent };
