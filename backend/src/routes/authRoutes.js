// --------------------------------------------------
// src/routes/authRoutes.js — Authentication routes
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register  — Create a new user
router.post("/register", register);

// POST /api/auth/login     — Login existing user
router.post("/login", login);

// GET /api/auth/me        — Get current user profile
router.get("/me", protect, getMe);

module.exports = router;
