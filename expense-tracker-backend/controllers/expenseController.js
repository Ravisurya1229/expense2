// // controllers/expenseController.js
// const Expense = require("../models/expense"); // << ensure lowercase path matches file
// const isValidId = require("../utils/isValidId");

// // GET /api/expenses
// exports.getExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json(expenses);
//   } catch (error) {
//     console.error("[getExpenses]", error);
//     res.status(500).json({ error: "Server Error", details: error.message });
//   }
// };

// // POST /api/expenses
// exports.addExpense = async (req, res) => {
//   try {
//     console.log("[addExpense] CT:", req.headers["content-type"]);
//     console.log("[addExpense] BODY RAW:", req.body, "TYPE:", typeof req.body);

//     const body = req.body || {};

//     const title = typeof body.title === "string" ? body.title.trim() : "";
//     const amountNum = Number(body.amount);
//     const category = typeof body.category === "string" ? body.category.trim() : "";
//     const date = body.date ? new Date(body.date) : undefined;

//     const missing = [];
//     if (!title) missing.push("title");
//     if (!isFinite(amountNum)) missing.push("amount");
//     if (!category) missing.push("category");

//     if (missing.length) {
//       return res.status(400).json({
//         error: "Please provide title, amount and category",
//         details: `Missing/invalid: ${missing.join(", ")}`,
//         received: { title: body.title, amount: body.amount, category: body.category, date: body.date }
//       });
//     }

//     const payload = { title, amount: amountNum, category, user: req.user._id };
//     if (date instanceof Date && !isNaN(date)) payload.date = date;

//     const saved = await Expense.create(payload);
//     return res.status(201).json(saved);
//   } catch (error) {
//     if (error?.name === "ValidationError") {
//       const messages = Object.values(error.errors).map(e => e.message);
//       return res.status(400).json({ error: messages[0] || "Validation failed" });
//     }
//     console.error("[addExpense]", error);
//     res.status(500).json({ error: "Server Error", details: error.message });
//   }
// };

// // PUT /api/expenses/:id
// exports.updateExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

//     // whitelist
//     const allowed = ["title", "amount", "category", "date"];
//     const payload = {};
//     for (const k of allowed) if (k in (req.body || {})) payload[k] = req.body[k];

//     const updated = await Expense.findOneAndUpdate(
//       { _id: id, user: req.user._id },
//       payload,
//       { new: true, runValidators: true }
//     );
//     if (!updated) return res.status(404).json({ error: "Expense not found" });
//     res.status(200).json(updated);
//   } catch (error) {
//     if (error?.name === "ValidationError") {
//       const messages = Object.values(error.errors).map(e => e.message);
//       return res.status(400).json({ error: messages[0] || "Validation failed" });
//     }
//     console.error("[updateExpense]", error);
//     res.status(500).json({ error: "Server Error", details: error.message });
//   }
// };

// // DELETE /api/expenses/:id
// exports.deleteExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

//     const deleted = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
//     if (!deleted) return res.status(404).json({ error: "Expense not found" });
//     res.status(200).json({ message: "Expense deleted successfully" });
//   } catch (error) {
//     console.error("[deleteExpense]", error);
//     res.status(500).json({ error: "Server Error", details: error.message });
//   }
// };


// controllers/expenseController.js
const axios = require("axios");
const Expense = require("../models/expense"); // note: lowercase file name
const isValidId = require("../utils/isValidId");

// Prefer combined finance URL; fall back to resource-specific
function webhookUrl() {
  return process.env.N8N_FINANCE_WEBHOOK_URL || process.env.N8N_EXPENSE_WEBHOOK_URL || null;
}

// Send full user object so n8n can email the logged-in user
async function safePostToN8N(event, user, data) {
  const url = webhookUrl();
  if (!url) return;

  const headers = { "Content-Type": "application/json" };
  if (process.env.N8N_SHARED_SECRET) headers["x-webhook-secret"] = process.env.N8N_SHARED_SECRET;

  const payload = {
    event,                                 // "expense_created" | "expense_updated" | "expense_deleted"
    ts: new Date().toISOString(),
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
    },
    expense: data,
  };

  try {
    const r = await axios.post(url, payload, { timeout: 7000, headers });
    if (process.env.DEBUG_N8N) console.log("[n8n] OK", r.status, url);
  } catch (e) {
    if (process.env.DEBUG_N8N) console.error("[n8n] FAIL", url, e.response?.status || "no-status", e.message);
  }
}

// GET /api/expenses
async function getExpenses(req, res) {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("[getExpenses]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}

// POST /api/expenses
async function addExpense(req, res) {
  try {
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

    const doc = { title, amount: amountNum, category, user: req.user._id };
    if (date instanceof Date && !isNaN(date)) doc.date = date;

    const saved = await Expense.create(doc);

    // notify n8n
    safePostToN8N("expense_created", req.user, {
      id: saved._id.toString(),
      title: saved.title,
      amount: saved.amount,
      category: saved.category,
      date: saved.date,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });

    return res.status(201).json(saved);
  } catch (error) {
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] || "Validation failed" });
    }
    console.error("[addExpense]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}

// PUT /api/expenses/:id
async function updateExpense(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

    const allowed = ["title", "amount", "category", "date"];
    const payload = {};
    for (const k of allowed) if (k in (req.body || {})) payload[k] = req.body[k];

    const updated = await Expense.findOneAndUpdate(
      { _id: id, user: req.user._id },
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Expense not found" });

    // notify n8n
    safePostToN8N("expense_updated", req.user, {
      id: updated._id.toString(),
      title: updated.title,
      amount: updated.amount,
      category: updated.category,
      date: updated.date,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });

    res.status(200).json(updated);
  } catch (error) {
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] || "Validation failed" });
    }
    console.error("[updateExpense]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}

// DELETE /api/expenses/:id
async function deleteExpense(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

    const deleted = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Expense not found" });

    // notify n8n
    safePostToN8N("expense_deleted", req.user, {
      id: deleted._id.toString(),
      title: deleted.title,
      amount: deleted.amount,
      category: deleted.category,
      date: deleted.date,
      createdAt: deleted.createdAt,
      updatedAt: deleted.updatedAt,
    });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("[deleteExpense]", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
};
