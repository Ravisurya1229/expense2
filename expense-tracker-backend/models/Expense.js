// const mongoose = require('mongoose');

// const expenseSchema = new mongoose.Schema({
//   // Reference to the user who owns this expense
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true // Add index for better query performance
//   },
  
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     maxLength: [100, 'Title cannot exceed 100 characters']
//   },
  
//   amount: {
//     type: Number,
//     required: [true, 'Amount is required'],
//     min: [0, 'Amount cannot be negative']
//   },
  
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     enum: ['food', 'transportation', 'entertainment', 'utilities', 'healthcare', 'shopping', 'education', 'travel', 'other'],
//     default: 'other'
//   },
  
//   description: {
//     type: String,
//     trim: true,
//     maxLength: [500, 'Description cannot exceed 500 characters']
//   },
  
//   date: {
//     type: Date,
//     required: [true, 'Date is required'],
//     default: Date.now
//   },
  
//   tags: [{
//     type: String,
//     trim: true,
//     lowercase: true
//   }],
  
//   paymentMethod: {
//     type: String,
//     enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'],
//     default: 'cash'
//   },
  
//   isRecurring: {
//     type: Boolean,
//     default: false
//   },
  
//   recurringPeriod: {
//     type: String,
//     enum: ['daily', 'weekly', 'monthly', 'yearly'],
//     required: function() { return this.isRecurring; }
//   }
// }, {
//   timestamps: true // Adds createdAt and updatedAt fields
// });

// // Compound index for better query performance on user-specific expenses
// expenseSchema.index({ userId: 1, date: -1 });
// expenseSchema.index({ userId: 1, category: 1 });

// // Instance method to check if user owns this expense
// expenseSchema.methods.isOwnedBy = function(userId) {
//   return this.userId.toString() === userId.toString();
// };

// // Static method to get user's total expenses
// expenseSchema.statics.getUserTotal = async function(userId, startDate, endDate) {
//   const match = { userId: new mongoose.Types.ObjectId(userId) };
  
//   if (startDate || endDate) {
//     match.date = {};
//     if (startDate) match.date.$gte = new Date(startDate);
//     if (endDate) match.date.$lte = new Date(endDate);
//   }
  
//   const result = await this.aggregate([
//     { $match: match },
//     { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
//   ]);
  
//   return result[0] || { total: 0, count: 0 };
// };

// // Static method to get expenses by category for a user
// expenseSchema.statics.getUserExpensesByCategory = async function(userId, startDate, endDate) {
//   const match = { userId: new mongoose.Types.ObjectId(userId) };
  
//   if (startDate || endDate) {
//     match.date = {};
//     if (startDate) match.date.$gte = new Date(startDate);
//     if (endDate) match.date.$lte = new Date(endDate);
//   }
  
//   return await this.aggregate([
//     { $match: match },
//     { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
//     { $sort: { total: -1 } }
//   ]);
// };

// module.exports = mongoose.model('Expense', expenseSchema);
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