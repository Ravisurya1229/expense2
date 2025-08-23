// const Expense = require("../models/Expense");

// // @desc    Get all expenses
// // @route   GET /api/expenses
// exports.getExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find().sort({ createdAt: -1 });
//     res.status(200).json(expenses);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // @desc    Add new expense
// // @route   POST /api/expenses
// exports.addExpense = async (req, res) => {
//   try {
//     const { title, amount, category, date } = req.body;

//     if (!title || !amount || !category) {
//       return res.status(400).json({ message: "Please provide all required fields" });
//     }

//     const expense = new Expense({ title, amount, category, date });
//     const savedExpense = await expense.save();

//     res.status(201).json(savedExpense);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // @desc    Update expense
// // @route   PUT /api/expenses/:id
// exports.updateExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedExpense) {
//       return res.status(404).json({ message: "Expense not found" });
//     }

//     res.status(200).json(updatedExpense);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // @desc    Delete expense
// // @route   DELETE /api/expenses/:id
// exports.deleteExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedExpense = await Expense.findByIdAndDelete(id);

//     if (!deletedExpense) {
//       return res.status(404).json({ message: "Expense not found" });
//     }

//     res.status(200).json({ message: "Expense deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };
//----------------------------------------------------------
// const Expense = require("../models/Expense");
// const fetch = require("node-fetch");

// // GET /api/expenses
// exports.getExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find({ userId: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json(expenses);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // POST /api/expenses
// exports.addExpense = async (req, res) => {
//   try {
//     const { title, amount, category, date, type } = req.body;
//     if (!title || !amount || !category || !type) {
//       return res.status(400).json({ message: "Please provide all required fields" });
//     }

//     const expense = new Expense({
//       userId: req.user._id,
//       title, amount, category, date, // date optional
//     });

//     const savedExpense = await expense.save();

//     // 🔗 send to n8n with user info
//     if (process.env.N8N_WEBHOOK_URL) {
//       try {
//         await fetch(process.env.N8N_WEBHOOK_URL, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             expense: savedExpense,
//             user: { name: req.user.name, email: req.user.email, phone: req.user.phone }
//           }),
//         });
//       } catch (err) {
//         console.error("n8n webhook error:", err.message);
//       }
//     }

//     res.status(201).json(savedExpense);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // PUT /api/expenses/:id
// exports.updateExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedExpense = await Expense.findOneAndUpdate(
//       { _id: id, userId: req.user._id },
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!updatedExpense) return res.status(404).json({ message: "Expense not found" });
//     res.status(200).json(updatedExpense);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // DELETE /api/expenses/:id
// exports.deleteExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedExpense = await Expense.findOneAndDelete({ _id: id, userId: req.user._id });
//     if (!deletedExpense) return res.status(404).json({ message: "Expense not found" });
//     res.status(200).json({ message: "Expense deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };


const Expense = require("../models/Expense");
const fetch = require("node-fetch"); // npm i node-fetch if you don't have it

// GET /api/expenses
exports.getExpenses = async (req, res) => {
  try {
    // If you later add user-based data, filter by req.user._id here.
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET /api/expenses/:id
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id.trim());
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/expenses/category/:category
exports.getExpensesByCategory = async (req, res) => {
  try {
    const expenses = await Expense.find({
      category: req.params.category.trim(),
    }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/expenses/date-range/:start/:end
exports.getExpensesByDateRange = async (req, res) => {
  try {
    const { start, end } = req.params;
    const expenses = await Expense.find({
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/expenses
exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const expense = new Expense({ title, amount, category, date });
    const savedExpense = await expense.save();

    // 👉 Send to n8n webhook (includes user context if available)
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expense: savedExpense,
            user: req.user
              ? { name: req.user.name, email: req.user.email, phone: req.user.phone }
              : null,
          }),
        });
        // console.log("Sent to n8n");
      } catch (e) {
        console.error("n8n webhook error:", e.message);
      }
    }

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = await Expense.findByIdAndUpdate(id.trim(), req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id.trim());

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
