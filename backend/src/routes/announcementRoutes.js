// --------------------------------------------------
// src/routes/announcementRoutes.js — Announcement routes
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementsByClub,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET  /api/announcements             — Get all announcements (any authenticated user)
router.get("/", protect, getAnnouncements);

// GET  /api/announcements/club/:clubId — Get announcements by club (any authenticated user)
router.get("/club/:clubId", protect, getAnnouncementsByClub);

// POST /api/announcements             — Create announcement (SuperAdmin & ClubAdmin)
router.post("/", protect, authorize("SuperAdmin", "ClubAdmin"), createAnnouncement);

// PUT  /api/announcements/:id         — Update announcement (SuperAdmin & ClubAdmin)
router.put("/:id", protect, authorize("SuperAdmin", "ClubAdmin"), updateAnnouncement);

// DELETE /api/announcements/:id       — Delete announcement (SuperAdmin & ClubAdmin)
router.delete("/:id", protect, authorize("SuperAdmin", "ClubAdmin"), deleteAnnouncement);

module.exports = router;
