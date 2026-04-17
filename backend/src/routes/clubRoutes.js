// --------------------------------------------------
// src/routes/clubRoutes.js — Club routes
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const { createClub, getClubs, joinClub } = require("../controllers/clubController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET  /api/clubs       — Get all clubs (any authenticated user)
router.get("/", protect, getClubs);

// POST /api/clubs       — Create a club (SuperAdmin only)
router.post("/", protect, authorize("SuperAdmin"), createClub);

// POST /api/clubs/:clubId/join — Join a club (any authenticated user)
router.post("/:clubId/join", protect, joinClub);

module.exports = router;
