const Income = require("../models/income");

/**
 * @route   GET /api/income
 * @access  Private
 */
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: incomes });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @route   POST /api/income
 * @access  Private
 */
exports.addIncome = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || amount == null || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide title, amount and category" });
    }

    const income = new Income({
      title,
      amount,
      category,
      date,
      user: req.user._id,
    });

    const savedIncome = await income.save();
    return res.status(201).json({ success: true, data: savedIncome });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @route   PUT /api/income/:id
 * @access  Private
 */
exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedIncome = await Income.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ success: false, message: "Income not found" });
    }

    return res.status(200).json({ success: true, data: updatedIncome });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @route   DELETE /api/income/:id
 * @access  Private
 */
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedIncome = await Income.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedIncome) {
      return res.status(404).json({ success: false, message: "Income not found" });
    }

    return res.status(200).json({ success: true, message: "Income deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
