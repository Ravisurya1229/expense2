// // const express = require("express");
// // const router = express.Router();
// // const Expense = require("../models/Expense");

// // // Create Expense
// // router.post("/", async (req, res) => {
// //   try {
// //     const expense = new Expense(req.body);
// //     await expense.save();
// //     res.status(201).json(expense);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // // Get All Expenses
// // router.get("/", async (req, res) => {
// //   try {
// //     const expenses = await Expense.find();
// //     res.json(expenses);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });
// // // Update expense (PUT)
// // router.put("/:id", async (req, res) => {
// //   try {
// //     const updatedExpense = await Expense.findByIdAndUpdate(
// //       req.params.id.trim(),        // remove hidden whitespace
// //       req.body,
// //       { new: true, runValidators: true }
// //     );

// //     if (!updatedExpense) {
// //       return res.status(404).json({ error: "Expense not found" });
// //     }

// //     res.json(updatedExpense);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });


// // // Delete Expense
// // router.delete("/:id", async (req, res) => {
// //   try {
// //     const deleted = await Expense.findByIdAndDelete(req.params.id);
// //     if (!deleted) return res.status(404).json({ message: "Expense not found" });
// //     res.json({ message: "Expense deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // module.exports = router;


// const express = require("express");
// const router = express.Router();
// const Expense = require("../models/Expense");

// // Create Expense
// router.post("/", async (req, res) => {
//   try {
//     const expense = new Expense(req.body);
//     await expense.save();
//     res.status(201).json(expense);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get All Expenses
// router.get("/", async (req, res) => {
//   try {
//     const expenses = await Expense.find().sort({ createdAt: -1 });
//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get Single Expense by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const expense = await Expense.findById(req.params.id.trim());
//     if (!expense) return res.status(404).json({ message: "Expense not found" });
//     res.json(expense);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get Expenses by Category
// router.get("/category/:category", async (req, res) => {
//   try {
//     const expenses = await Expense.find({ category: req.params.category.trim() }).sort({ date: -1 });
//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get Expenses by Date Range
// router.get("/date-range/:start/:end", async (req, res) => {
//   try {
//     const { start, end } = req.params;
//     const expenses = await Expense.find({
//       date: {
//         $gte: new Date(start),
//         $lte: new Date(end)
//       }
//     }).sort({ date: -1 });
//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update Expense (PUT)
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedExpense = await Expense.findByIdAndUpdate(
//       req.params.id.trim(),
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!updatedExpense) return res.status(404).json({ error: "Expense not found" });
//     res.json(updatedExpense);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete Expense
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Expense.findByIdAndDelete(req.params.id.trim());
//     if (!deleted) return res.status(404).json({ message: "Expense not found" });
//     res.json({ message: "Expense deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
// -----------------------------------------------------------

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth"); // <-- requires a JWT auth middleware
const {
  getExpenses,
  getExpenseById,
  getExpensesByCategory,
  getExpensesByDateRange,
  addExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

// Protect everything below with JWT
router.use(auth);

// List all
router.get("/", getExpenses);

// Filtered lists (specific routes BEFORE :id)
router.get("/category/:category", getExpensesByCategory);
router.get("/date-range/:start/:end", getExpensesByDateRange);

// Single by id
router.get("/:id", getExpenseById);

// Create / Update / Delete
router.post("/", addExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
