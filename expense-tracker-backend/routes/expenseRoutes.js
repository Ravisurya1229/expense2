const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

// protect all routes
router.use(auth);

// Routes
router.get("/", getExpenses);
router.post("/", addExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
