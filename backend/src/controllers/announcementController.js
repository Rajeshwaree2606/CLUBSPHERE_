// --------------------------------------------------
// src/controllers/announcementController.js — Announcement operations
// --------------------------------------------------

const { pool } = require("../config/db");

// ========================
//  CREATE ANNOUNCEMENT — POST /api/announcements
//  SuperAdmin & ClubAdmin only
// ========================
const createAnnouncement = async (req, res) => {
  try {
    const { club_id, title, message } = req.body;

    // --- Input validation ---
    if (!club_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "club_id, title, and message are required",
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

    // --- Insert announcement ---
    const result = await pool.query(
      `INSERT INTO announcements (club_id, title, message, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [club_id, title, message, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Create Announcement Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating announcement",
    });
  }
};

// ========================
//  GET ALL ANNOUNCEMENTS — GET /api/announcements
//  Any authenticated user
// ========================
const getAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.title, a.message, a.created_at,
              c.name AS club_name,
              u.name AS created_by_name
       FROM announcements a
       LEFT JOIN clubs c ON a.club_id = c.id
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get Announcements Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching announcements",
    });
  }
};

// ========================
//  GET ANNOUNCEMENTS BY CLUB — GET /api/announcements/club/:clubId
//  Any authenticated user
// ========================
const getAnnouncementsByClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    // --- Check if club exists ---
    const clubCheck = await pool.query(
      "SELECT id, name FROM clubs WHERE id = $1",
      [clubId]
    );

    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    const result = await pool.query(
      `SELECT a.id, a.title, a.message, a.created_at,
              u.name AS created_by_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.club_id = $1
       ORDER BY a.created_at DESC`,
      [clubId]
    );

    return res.status(200).json({
      success: true,
      club: clubCheck.rows[0].name,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get Announcements By Club Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching club announcements",
    });
  }
};

module.exports = { createAnnouncement, getAnnouncements, getAnnouncementsByClub };
