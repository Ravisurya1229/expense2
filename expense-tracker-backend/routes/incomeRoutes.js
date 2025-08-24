// const express = require("express");
// const router = express.Router();
// const Income = require("../models/income");

// // Create Income
// router.post("/", async (req, res) => {
//   try {
//     const income = new Income(req.body);
//     await income.save();
//     res.status(201).json(income);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get All Incomes
// router.get("/", async (req, res) => {
//   try {
//     const incomes = await Income.find();
//     res.json(incomes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update Income
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedIncome = await Income.findByIdAndUpdate(
//       req.params.id.trim(),
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updatedIncome) {
//       return res.status(404).json({ error: "Income not found" });
//     }

//     res.json(updatedIncome);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete Income
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Income.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Income not found" });
//     res.json({ message: "Income deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Income = require("../models/income");
const auth = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Create Income
router.post("/", async (req, res) => {
  try {
    const incomeData = {
      ...req.body,
      user: req.user._id
    };
    const income = new Income(incomeData);
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Incomes for authenticated user
router.get("/", async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Income by ID (user must own it)
router.get("/:id", async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id.trim(),
      user: req.user._id
    });
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Income (user must own it)
router.put("/:id", async (req, res) => {
  try {
    const updatedIncome = await Income.findOneAndUpdate(
      { _id: req.params.id.trim(), user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ error: "Income not found" });
    }

    res.json(updatedIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Income (user must own it)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deleted) return res.status(404).json({ message: "Income not found" });
    res.json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;