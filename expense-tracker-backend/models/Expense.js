// models/expense.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be a positive number"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
