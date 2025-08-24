const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");

// protect everything
router.use(auth);

// routes
router.get("/", getIncomes);
router.post("/", addIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

module.exports = router;
