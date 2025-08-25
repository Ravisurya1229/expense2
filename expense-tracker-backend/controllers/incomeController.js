// controllers/incomeController.js
const Income = require("../models/income");
const isValidId = require("../utils/isValidId");

// GET /api/income
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(incomes);
  } catch (err) {
    console.error("[getIncomes]", err);
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
};

// POST /api/income
exports.addIncome = async (req, res) => {
  try {
    console.log("[addIncome] CT:", req.headers["content-type"]);
    console.log("[addIncome] BODY RAW:", req.body, "TYPE:", typeof req.body);

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

    const saved = await Income.create(payload);
    return res.status(201).json(saved);
  } catch (err) {
    if (err?.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] || "Validation failed" });
    }
    console.error("[addIncome]", err);
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
};

// PUT /api/income/:id
exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

    // whitelist
    const allowed = ["title", "amount", "category", "date"];
    const payload = {};
    for (const k of allowed) if (k in (req.body || {})) payload[k] = req.body[k];

    const updated = await Income.findOneAndUpdate(
      { _id: id, user: req.user._id },
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Income not found" });
    return res.status(200).json(updated);
  } catch (err) {
    if (err?.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] || "Validation failed" });
    }
    console.error("[updateIncome]", err);
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
};

// DELETE /api/income/:id
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

    const deleted = await Income.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Income not found" });
    return res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    console.error("[deleteIncome]", err);
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
};
