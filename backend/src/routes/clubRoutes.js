// --------------------------------------------------
// src/routes/clubRoutes.js — Club routes
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const { createClub, getClubs, joinClub, leaveClub, updateClub, deleteClub } = require("../controllers/clubController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET  /api/clubs       — Get all clubs (any authenticated user)
router.get("/", protect, getClubs);

// POST /api/clubs       — Create a club (SuperAdmin only)
router.post("/", protect, authorize("SuperAdmin"), createClub);

// PUT  /api/clubs/:id   — Update a club (SuperAdmin only)
router.put("/:id", protect, authorize("SuperAdmin"), updateClub);

// DELETE /api/clubs/:id — Delete a club (SuperAdmin only)
router.delete("/:id", protect, authorize("SuperAdmin"), deleteClub);

// POST /api/clubs/:clubId/join — Join a club (any authenticated user)
router.post("/:clubId/join", protect, joinClub);

// POST /api/clubs/:clubId/leave — Leave a club (any authenticated user)
router.post("/:clubId/leave", protect, leaveClub);

module.exports = router;
