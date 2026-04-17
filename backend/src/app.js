// --------------------------------------------------
// src/app.js — Express application setup
// --------------------------------------------------

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// ---- Import Routes ----
const authRoutes = require("./routes/authRoutes");
const clubRoutes = require("./routes/clubRoutes");
const eventRoutes = require("./routes/eventRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

// ---- Global Middleware ----
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Set security-related HTTP headers
app.use(morgan("dev")); // HTTP request logger
app.use(express.json()); // Parse incoming JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ---- Health Check Route ----
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ClubSphere API is running 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ---- API Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/attendance", attendanceRoutes);

// ---- 404 Handler (catch-all) ----
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
