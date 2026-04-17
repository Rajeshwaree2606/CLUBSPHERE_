// --------------------------------------------------
// src/controllers/attendanceController.js — Attendance operations
// --------------------------------------------------

const { pool } = require("../config/db");

// Valid attendance statuses
const VALID_STATUSES = ["Present", "Absent", "Late"];

// ========================
//  MARK ATTENDANCE — POST /api/attendance
//  SuperAdmin & ClubAdmin only
// ========================
const markAttendance = async (req, res) => {
  try {
    const { event_id, user_id, status } = req.body;

    // --- Input validation ---
    if (!event_id || !user_id || !status) {
      return res.status(400).json({
        success: false,
        message: "event_id, user_id, and status are required",
      });
    }

    // --- Validate status ---
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // --- Check if event exists ---
    const eventCheck = await pool.query(
      "SELECT id FROM events WHERE id = $1",
      [event_id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // --- Check if user exists ---
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure the user is registered for the event (idempotent)
    await pool.query(
      `INSERT INTO event_registrations (event_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (event_id, user_id) DO NOTHING`,
      [event_id, user_id]
    );

    // --- Check if attendance already marked (unique constraint) ---
    const existing = await pool.query(
      "SELECT id FROM attendance WHERE event_id = $1 AND user_id = $2",
      [event_id, user_id]
    );

    if (existing.rows.length > 0) {
      // Update existing attendance record instead of duplicating
      const updated = await pool.query(
        `UPDATE attendance
         SET status = $1, marked_at = CURRENT_TIMESTAMP
         WHERE event_id = $2 AND user_id = $3
         RETURNING *`,
        [status, event_id, user_id]
      );

      return res.status(200).json({
        success: true,
        message: "Attendance updated successfully",
        data: updated.rows[0],
      });
    }

    // --- Insert new attendance record ---
    const result = await pool.query(
      `INSERT INTO attendance (event_id, user_id, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [event_id, user_id, status]
    );

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Mark Attendance Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
    });
  }
};

// ========================
//  GET ATTENDANCE BY EVENT — GET /api/attendance/event/:eventId
//  Any authenticated user
// ========================
const getAttendanceByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // --- Check if event exists ---
    const eventCheck = await pool.query(
      "SELECT id, title FROM events WHERE id = $1",
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Return the roster of registered users, with attendance status if marked.
    // If not marked yet, status is returned as "pending" (not stored in DB).
    const result = await pool.query(
      `SELECT
         u.id AS user_id,
         u.name AS user_name,
         u.email AS user_email,
         COALESCE(a.status, 'pending') AS status,
         a.marked_at
       FROM event_registrations er
       INNER JOIN users u ON er.user_id = u.id
       LEFT JOIN attendance a
         ON a.event_id = er.event_id AND a.user_id = er.user_id
       WHERE er.event_id = $1
       ORDER BY u.name ASC`,
      [eventId]
    );

    return res.status(200).json({
      success: true,
      event: eventCheck.rows[0].title,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get Attendance By Event Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance",
    });
  }
};

// ========================
//  GET MY ATTENDANCE — GET /api/attendance/me
//  Logged-in user's own attendance history
// ========================
const getMyAttendance = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.status, a.marked_at,
              e.id AS event_id, e.title AS event_title, e.event_date,
              c.name AS club_name
       FROM attendance a
       LEFT JOIN events e ON a.event_id = e.id
       LEFT JOIN clubs c ON e.club_id = c.id
       WHERE a.user_id = $1
       ORDER BY e.event_date DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get My Attendance Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching your attendance",
    });
  }
};

module.exports = { markAttendance, getAttendanceByEvent, getMyAttendance };
