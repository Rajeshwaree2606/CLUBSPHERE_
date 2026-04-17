// --------------------------------------------------
// src/routes/eventRoutes.js — Event routes
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET    /api/events       — Get all events (any authenticated user)
router.get("/", protect, getEvents);

// POST   /api/events/:eventId/join — Join/RSVP to an event (any authenticated user)
router.post("/:eventId/join", protect, joinEvent);

// GET    /api/events/:id   — Get single event (any authenticated user)
router.get("/:id", protect, getEventById);

// POST   /api/events       — Create event (SuperAdmin & ClubAdmin)
router.post("/", protect, authorize("SuperAdmin", "ClubAdmin"), createEvent);

// PUT    /api/events/:id   — Update event (SuperAdmin & ClubAdmin)
router.put("/:id", protect, authorize("SuperAdmin", "ClubAdmin"), updateEvent);

// DELETE /api/events/:id   — Delete event (SuperAdmin & ClubAdmin)
router.delete("/:id", protect, authorize("SuperAdmin", "ClubAdmin"), deleteEvent);

module.exports = router;
