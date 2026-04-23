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
const budgetRoutes = require("./routes/budgetRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();

// ---- Global Middleware ----
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:8082",
  "https://clubsphere-bhuvan-somisettys-projects.vercel.app",
  "https://clubsphere-sigma.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        console.error("❌ CORS Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Root Route ----
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ClubSphere backend is live 🚀",
  });
});

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
app.use("/api/budgets", budgetRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// ---- 404 Handler ----
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