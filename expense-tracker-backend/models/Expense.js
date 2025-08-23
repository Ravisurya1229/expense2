// const mongoose = require("mongoose");

// const expenseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     date: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Prevent OverwriteModelError
// module.exports = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
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
      enum: {
        values: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"],
        message: "{VALUE} is not a valid category",
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError in dev/Hot Reload
module.exports =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

