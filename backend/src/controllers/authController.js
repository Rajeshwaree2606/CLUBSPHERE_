// --------------------------------------------------
// src/controllers/authController.js — Register & Login
// --------------------------------------------------

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const generateToken = require("../utils/generateToken");

// Allowed roles
const VALID_ROLES = ["SuperAdmin", "ClubAdmin", "Member", "Alumni"];

// ========================
//  REGISTER  — POST /api/auth/register
// ========================
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // --- Input validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Validate role (if provided)
    const userRole = role || "Member";
    if (!VALID_ROLES.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    // --- Check for duplicate email ---
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // --- Hash the password ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- Insert user into database ---
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, userRole]
    );

    const user = newUser.rows[0];

    // --- Generate JWT ---
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        token,
      },
    });
  } catch (error) {
    console.error("❌ Register Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ========================
//  LOGIN  — POST /api/auth/login
// ========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Input validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // --- Find user by email ---
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // --- Compare passwords ---
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --- Generate JWT ---
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, xp, level FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("❌ Get Me Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, login, getMe };
