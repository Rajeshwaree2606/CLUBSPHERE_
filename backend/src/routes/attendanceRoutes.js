// --------------------------------------------------
// src/routes/attendanceRoutes.js — Attendance routes
// --------------------------------------------------

const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendanceByEvent,
  getMyAttendance,
  generateQR,
  scanQR,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET  /api/attendance/me               — Get logged-in user's attendance (any authenticated user)
router.get("/me", protect, getMyAttendance);

// GET  /api/attendance/event/:eventId   — Get attendance by event (any authenticated user)
router.get("/event/:eventId", protect, getAttendanceByEvent);

// POST /api/attendance                  — Mark attendance (SuperAdmin & ClubAdmin)
router.post("/", protect, authorize("SuperAdmin", "ClubAdmin"), markAttendance);

// POST /api/attendance/generate-qr/:eventId — Generate QR code token (SuperAdmin & ClubAdmin)
router.post("/generate-qr/:eventId", protect, authorize("SuperAdmin", "ClubAdmin"), generateQR);

// POST /api/attendance/scan             — Scan QR code to mark attendance (any authenticated user)
router.post("/scan", protect, scanQR);

module.exports = router;
