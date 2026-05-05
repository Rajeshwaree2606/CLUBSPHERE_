// --------------------------------------------------
// src/routes/eventRoutes.js — Event routes
// --------------------------------------------------

const express = require('express');
const router  = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  getOrGenerateQR,
  joinEvent,
  updateEvent,
  deleteEvent,
  generateQRToken,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET    /api/events          — All events (any authenticated user)
router.get('/', protect, getEvents);

// POST   /api/events          — Create event (SuperAdmin & ClubAdmin)
router.post('/', protect, authorize('SuperAdmin', 'ClubAdmin'), createEvent);

// GET    /api/events/:id      — Single event (any authenticated user)
router.get('/:id', protect, getEventById);

// GET    /api/events/:id/qr   — Get or auto-generate QR for event (SuperAdmin & ClubAdmin)
//        This fixes "No QR token" for old events by backfilling automatically
router.get('/:id/qr', protect, authorize('SuperAdmin', 'ClubAdmin'), getOrGenerateQR);

// POST   /api/events/:id/qr-token — Regenerate QR (SuperAdmin & ClubAdmin)
router.post('/:id/qr-token', protect, authorize('SuperAdmin', 'ClubAdmin'), generateQRToken);

// POST   /api/events/:eventId/join — Join event (any authenticated user)
router.post('/:eventId/join', protect, joinEvent);

// PUT    /api/events/:id      — Update event (SuperAdmin & ClubAdmin)
router.put('/:id', protect, authorize('SuperAdmin', 'ClubAdmin'), updateEvent);

// DELETE /api/events/:id      — Delete event (SuperAdmin & ClubAdmin)
router.delete('/:id', protect, authorize('SuperAdmin', 'ClubAdmin'), deleteEvent);

module.exports = router;
