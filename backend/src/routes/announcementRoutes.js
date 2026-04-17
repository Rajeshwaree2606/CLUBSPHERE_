// --------------------------------------------------
// src/routes/announcementRoutes.js — Announcement routes
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementsByClub,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET  /api/announcements             — Get all announcements (any authenticated user)
router.get("/", protect, getAnnouncements);

// GET  /api/announcements/club/:clubId — Get announcements by club (any authenticated user)
router.get("/club/:clubId", protect, getAnnouncementsByClub);

// POST /api/announcements             — Create announcement (SuperAdmin & ClubAdmin)
router.post("/", protect, authorize("SuperAdmin", "ClubAdmin"), createAnnouncement);

module.exports = router;
