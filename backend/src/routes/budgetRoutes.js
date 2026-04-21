const express = require("express");
const router = express.Router();
const { createBudget, getBudgets, updateBudget, deleteBudget } = require("../controllers/budgetController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Any authenticated user can view budgets
router.get("/", protect, getBudgets);

// Only admins can manage budget records
router.post("/", protect, authorize("SuperAdmin", "ClubAdmin"), createBudget);
router.put("/:id", protect, authorize("SuperAdmin", "ClubAdmin"), updateBudget);
router.delete("/:id", protect, authorize("SuperAdmin", "ClubAdmin"), deleteBudget);

module.exports = router;
