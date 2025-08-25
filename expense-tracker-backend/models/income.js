// models/income.js
const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be a positive number"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // Match your INCOME_CATEGORIES in the frontend
      enum: ["Salary", "Business", "Freelance", "Investments", "Gift", "Other"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Income || mongoose.model("Income", incomeSchema);
