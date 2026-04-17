// --------------------------------------------------
// src/middleware/authMiddleware.js — protect + authorize
// --------------------------------------------------

const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/**
 * protect — Verifies the JWT token from the Authorization header.
 * Attaches the authenticated user object to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (exclude password)
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user not found",
      });
    }

    // Attach user to request object
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid token",
    });
  }
};

/**
 * authorize — Restricts access to specific roles.
 * Usage: authorize("SuperAdmin", "ClubAdmin")
 *
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — requires one of: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
