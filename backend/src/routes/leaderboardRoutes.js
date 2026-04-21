const express = require("express");
const router = express.Router();
const { getLeaderboard, addXP } = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getLeaderboard);
router.post("/add-xp", protect, addXP);

module.exports = router;
