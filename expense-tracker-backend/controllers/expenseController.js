// controllers/expenseController.js
const Expense = require("../models/expense"); // << ensure lowercase path matches file
const isValidId = require("../utils/isValidId");

// GET /api/expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("[getExpenses]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// POST /api/expenses
exports.addExpense = async (req, res) => {
  try {
    console.log("[addExpense] CT:", req.headers["content-type"]);
    console.log("[addExpense] BODY RAW:", req.body, "TYPE:", typeof req.body);

    const body = req.body || {};

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const amountNum = Number(body.amount);
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const date = body.date ? new Date(body.date) : undefined;

    const missing = [];
    if (!title) missing.push("title");
    if (!isFinite(amountNum)) missing.push("amount");
    if (!category) missing.push("category");

    if (missing.length) {
      return res.status(400).json({
        error: "Please provide title, amount and category",
        details: `Missing/invalid: ${missing.join(", ")}`,
        received: { title: body.title, amount: body.amount, category: body.category, date: body.date }
      });
    }

    const payload = { title, amount: amountNum, category, user: req.user._id };
    if (date instanceof Date && !isNaN(date)) payload.date = date;

    const saved = await Expense.create(payload);
    return res.status(201).json(saved);
  } catch (error) {
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] || "Validation failed" });
    }
    console.error("[addExpense]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

    // whitelist
    const allowed = ["title", "amount", "category", "date"];
    const payload = {};
    for (const k of allowed) if (k in (req.body || {})) payload[k] = req.body[k];

    const updated = await Expense.findOneAndUpdate(
      { _id: id, user: req.user._id },
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Expense not found" });
    res.status(200).json(updated);
  } catch (error) {
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] || "Validation failed" });
    }
    console.error("[updateExpense]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

    const deleted = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Expense not found" });
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("[deleteExpense]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};
