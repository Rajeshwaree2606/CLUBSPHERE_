const { pool } = require("../config/db");

const getLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, xp, level 
       FROM users 
       WHERE role != 'SuperAdmin' 
       ORDER BY xp DESC, name ASC 
       LIMIT 50`
    );

    // Add rank in logic
    const rankedData = result.rows.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return res.status(200).json({
      success: true,
      data: rankedData
    });
  } catch (error) {
    console.error("❌ Get Leaderboard Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const addXP = async (req, res) => {
  try {
    const { xpToAdd } = req.body;
    const userId = req.user.id;

    if (!xpToAdd) return res.status(400).json({ success: false, message: "xpToAdd required" });

    // Level formula: level = floor(xp / 100) + 1
    const result = await pool.query(
      `UPDATE users SET xp = xp + $1, level = FLOOR((xp + $1) / 100) + 1
       WHERE id = $2
       RETURNING id, name, xp, level`,
      [xpToAdd, userId]
    );

    return res.status(200).json({
      success: true,
      message: "XP added successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Add XP Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getLeaderboard, addXP };
