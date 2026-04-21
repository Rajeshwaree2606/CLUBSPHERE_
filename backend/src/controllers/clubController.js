// --------------------------------------------------
// src/controllers/clubController.js — Club operations
// --------------------------------------------------

const { pool } = require("../config/db");

// ========================
//  CREATE CLUB — POST /api/clubs
//  Only SuperAdmin can create
// ========================
const createClub = async (req, res) => {
  try {
    const { name, description } = req.body;

    // --- Input validation ---
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Club name is required",
      });
    }

    // --- Check for duplicate club name ---
    const existing = await pool.query(
      "SELECT id FROM clubs WHERE LOWER(name) = LOWER($1)",
      [name]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A club with this name already exists",
      });
    }

    // --- Insert club ---
    const result = await pool.query(
      `INSERT INTO clubs (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Create Club Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating club",
    });
  }
};

// ========================
//  GET ALL CLUBS — GET /api/clubs
//  Any authenticated user can view
//  Includes memberCount + joined for the current user
// ========================
const getClubs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.created_at,
              u.name AS created_by_name,
              COALESCE(cm_counts.member_count, 0)::int AS "memberCount",
              (cm_me.user_id IS NOT NULL) AS joined
       FROM clubs c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN (
         SELECT club_id, COUNT(*) AS member_count
         FROM club_members
         GROUP BY club_id
       ) cm_counts ON cm_counts.club_id = c.id
       LEFT JOIN club_members cm_me
         ON cm_me.club_id = c.id AND cm_me.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get Clubs Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching clubs",
    });
  }
};

// ========================
//  JOIN CLUB — POST /api/clubs/:clubId/join
//  Any authenticated user
// ========================
const joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    // --- Check if club exists ---
    const clubCheck = await pool.query(
      "SELECT id, name, description, created_at FROM clubs WHERE id = $1",
      [clubId]
    );

    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    // --- Insert membership (idempotent) ---
    await pool.query(
      `INSERT INTO club_members (club_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (club_id, user_id) DO NOTHING`,
      [clubId, req.user.id]
    );

    const memberCountRes = await pool.query(
      "SELECT COUNT(*)::int AS member_count FROM club_members WHERE club_id = $1",
      [clubId]
    );

    return res.status(200).json({
      success: true,
      message: "Joined club successfully",
      data: {
        ...clubCheck.rows[0],
        memberCount: memberCountRes.rows[0]?.member_count || 0,
        joined: true,
      },
    });
  } catch (error) {
    console.error("❌ Join Club Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while joining club",
    });
  }
};

// ========================
//  LEAVE CLUB — POST /api/clubs/:clubId/leave
//  Any authenticated user
// ========================
const leaveClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    await pool.query(
      "DELETE FROM club_members WHERE club_id = $1 AND user_id = $2",
      [clubId, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Left club successfully",
    });
  } catch (error) {
    console.error("❌ Leave Club Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while leaving club",
    });
  }
};

// ========================
//  UPDATE CLUB — PUT /api/clubs/:id
//  SuperAdmin only
// ========================
const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE clubs SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Club updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Update Club Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while updating club" });
  }
};

// ========================
//  DELETE CLUB — DELETE /api/clubs/:id
//  SuperAdmin only
// ========================
const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM clubs WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Club deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Club Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while deleting club" });
  }
};

module.exports = { createClub, getClubs, joinClub, leaveClub, updateClub, deleteClub };
