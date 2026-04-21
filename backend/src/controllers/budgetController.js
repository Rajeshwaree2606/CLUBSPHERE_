const { pool } = require("../config/db");

// ========================
//  CREATE BUDGET — POST /api/budgets
//  Only SuperAdmin and ClubAdmin can create
// ========================
const createBudget = async (req, res) => {
  try {
    const { club_id, title, amount, type, description } = req.body;

    if (!club_id || !title || amount === undefined || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (club_id, title, amount, type)",
      });
    }

    const result = await pool.query(
      `INSERT INTO budgets (club_id, title, amount, type, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [club_id, title, amount, type, description || null, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: "Budget record created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Create Budget Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating budget record",
    });
  }
};

// ========================
//  GET ALL BUDGETS — GET /api/budgets
//  Can be filtered by club_id via query param
// ========================
const getBudgets = async (req, res) => {
  try {
    const { club_id } = req.query;
    
    let query = "SELECT * FROM budgets";
    let params = [];

    if (club_id) {
      query += " WHERE club_id = $1";
      params.push(club_id);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Get Budgets Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching budgets",
    });
  }
};

// ========================
//  UPDATE BUDGET — PUT /api/budgets/:id
// ========================
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, description } = req.body;

    const result = await pool.query(
      `UPDATE budgets 
       SET title = COALESCE($1, title), 
           amount = COALESCE($2, amount), 
           type = COALESCE($3, type), 
           description = COALESCE($4, description)
       WHERE id = $5
       RETURNING *`,
      [title, amount, type, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Budget record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Budget record updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Update Budget Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while updating budget" });
  }
};

// ========================
//  DELETE BUDGET — DELETE /api/budgets/:id
// ========================
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM budgets WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Budget record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Budget record deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Budget Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while deleting budget" });
  }
};

module.exports = { createBudget, getBudgets, updateBudget, deleteBudget };
