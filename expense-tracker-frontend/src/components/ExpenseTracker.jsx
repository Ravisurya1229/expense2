// import React, { useEffect, useMemo, useState, useContext } from "react";
// import {
//   PlusCircle, DollarSign, TrendingUp, TrendingDown, Calendar, Search,
//   Trash2, ArrowUpRight, ArrowDownRight, Filter
// } from "lucide-react";
// import { formatCurrency, idGen } from "../utils/format";
// import { BarCard, LineCard, PieCard } from "./ChartCard";
// import { AuthContext } from "../utils/AuthContext"; // <-- Added

// const defaultSeed = [
//   { id: 1, title: "Grocery Shopping", amount: 85.5, category: "Food", date: "2024-08-20", type: "expense" },
//   { id: 2, title: "Salary", amount: 3500.0, category: "Income", date: "2024-08-20", type: "income" },
//   { id: 3, title: "Coffee", amount: 4.5, category: "Food", date: "2024-08-19", type: "expense" },
//   { id: 4, title: "Gas Station", amount: 45.0, category: "Transport", date: "2024-08-19", type: "expense" },
//   { id: 5, title: "Netflix Subscription", amount: 12.99, category: "Entertainment", date: "2024-08-18", type: "expense" }
// ];

// const categories = ["Food","Transport","Entertainment","Shopping","Bills","Health","Income"];

// const categoryColors = {
//   Food: "#ff6b6b",
//   Transport: "#4d94ff",
//   Entertainment: "#a64dff",
//   Shopping: "#ff4da6",
//   Bills: "#ff595e",
//   Health: "#32d48e",
//   Income: "#00c851"
// };

// export default function ExpenseTracker() {
//   const { user, logout } = useContext(AuthContext); // <-- Added

//   const [expenses, setExpenses] = useState(() => {
//     try {
//       const cached = localStorage.getItem("expenses:v1");
//       return cached ? JSON.parse(cached) : defaultSeed;
//     } catch {
//       return defaultSeed;
//     }
//   });

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterCategory, setFilterCategory] = useState("all");
//   const [filterType, setFilterType] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   const [newExpense, setNewExpense] = useState({
//     title: "", amount: "", category: "Food", type: "expense"
//   });

//   // persist
//   useEffect(() => {
//     localStorage.setItem("expenses:v1", JSON.stringify(expenses));
//   }, [expenses]);

//   const addExpense = () => {
//     const title = newExpense.title.trim();
//     const amount = parseFloat(newExpense.amount);
//     if (!title || !Number.isFinite(amount) || amount <= 0) return;

//     const item = {
//       id: idGen(),
//       title,
//       amount,
//       category: newExpense.category,
//       date: new Date().toISOString().split("T")[0],
//       type: newExpense.type
//     };
//     setExpenses((prev) => [item, ...prev]);
//     setNewExpense({ title: "", amount: "", category: "Food", type: "expense" });
//   };

//   const deleteExpense = (id) => setExpenses((prev) => prev.filter((e) => e.id !== id));
//   const onEnter = (e, action) => { if (e.key === "Enter") action(); };

//   const sortedExpenses = useMemo(
//     () => [...expenses].sort((a,b) => (b.date + b.id).localeCompare(a.date + a.id)),
//     [expenses]
//   );

//   const filteredExpenses = useMemo(() =>
//     sortedExpenses.filter((exp) => {
//       const s = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
//       const c = filterCategory === "all" || exp.category === filterCategory;
//       const t = filterType === "all" || exp.type === filterType;
//       const f = !dateFrom || exp.date >= dateFrom;
//       const to = !dateTo || exp.date <= dateTo;
//       return s && c && t && f && to;
//     }), [sortedExpenses, searchTerm, filterCategory, filterType, dateFrom, dateTo]
//   );

//   const totals = useMemo(() => {
//     const income = expenses.filter(e => e.type==="income").reduce((s,e)=>s+e.amount,0);
//     const spend  = expenses.filter(e => e.type==="expense").reduce((s,e)=>s+e.amount,0);
//     return { totalIncome: income, totalExpenses: spend, balance: income - spend };
//   }, [expenses]);

//   const getCategoryColor = (category) => categoryColors[category] || "#6b7280";

//   const byCategory = useMemo(() => {
//     const map = {};
//     expenses.forEach(e => {
//       const k = e.category;
//       const val = e.type === "expense" ? e.amount : 0;
//       map[k] = (map[k] || 0) + val;
//     });
//     return Object.entries(map).map(([label, value]) => ({ label, value }));
//   }, [expenses]);

//   const byMonth = useMemo(() => {
//     const map = {};
//     expenses.forEach(e => {
//       const key = e.date.slice(0,7);
//       const sign = e.type === "income" ? 1 : -1;
//       map[key] = (map[key] || 0) + sign * e.amount;
//     });
//     return Object.entries(map)
//       .sort(([a],[b]) => a.localeCompare(b))
//       .map(([label, value]) => ({ label, value: +value.toFixed(2) }));
//   }, [expenses]);

//   const balanceTrend = useMemo(() => {
//     const days = [...new Set(expenses.map(e => e.date))].sort();
//     let running = 0;
//     return days.map(d => {
//       expenses.filter(e=>e.date===d).forEach(e => running += (e.type==="income" ? e.amount : -e.amount));
//       return { label: d.slice(5), value: +running.toFixed(2) };
//     });
//   }, [expenses]);

//   return (
//     <div>
//       {/* Hero header */}
//       <div className="flex flex-col sm:flex-row justify-between items-center text-center mb-6 sm:mb-8">
//         <div>
//           <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
//             Expense <span className="text-transparent bg-clip-text"
//               style={{ background: "linear-gradient(45deg, #a64dff, #ff4da6)",
//                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Tracker</span>
//           </h1>
//           <p className="text-slate-500 dark:text-slate-300">Take control of your finances with style</p>
//         </div>

//         {/* User info and logout */}
//         <div className="mt-4 sm:mt-0">
//           {user && (
//             <div className="flex items-center gap-4">
//               <span className="text-slate-600 dark:text-slate-300 text-sm">
//                 Signed in as <strong>{user.email}</strong>
//               </span>
//               <button
//                 onClick={logout}
//                 className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
//               >
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ...rest of your component stays unchanged */}
//       {/* Stats, Add Transaction, Filters, Transactions, Insights */}
//       {/* (keep all the code you had after this header unchanged) */}
//     </div>
//   );
// }


//with backend integrated

// src/components/ExpenseTracker.jsx
import React, { useEffect, useState } from "react";
import {
  fetchExpenses,
  addExpense,
  deleteExpense,
  fetchIncome,
  addIncome,
  deleteIncome,
} from "../api";

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense", // or "income"
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [exp, inc] = await Promise.all([fetchExpenses(), fetchIncome()]);
        setExpenses(exp);
        setIncome(inc);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    loadData();
  }, []);

  // Add expense or income
  const handleAdd = async (e) => {
    e.preventDefault();
    const { title, amount, category, type } = formData;
    if (!title || !amount || !category) return alert("All fields required");

    try {
      if (type === "expense") {
        const saved = await addExpense({ title, amount: +amount, category });
        setExpenses((prev) => [...prev, saved]);
      } else {
        const saved = await addIncome({ title, amount: +amount, category });
        setIncome((prev) => [...prev, saved]);
      }
      setFormData({ title: "", amount: "", category: "", type: "expense" });
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  // Delete expense or income
  const handleDelete = async (id, type) => {
    try {
      if (type === "expense") {
        await deleteExpense(id);
        setExpenses((prev) => prev.filter((e) => e._id !== id));
      } else {
        await deleteIncome(id);
        setIncome((prev) => prev.filter((i) => i._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="border p-2 w-full rounded"
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </form>

      {/* Expenses List */}
      <h2 className="text-xl font-semibold mb-2">Expenses</h2>
      <ul className="mb-4 space-y-2">
        {expenses.map((exp) => (
          <li
            key={exp._id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>
              {exp.title} - ₹{exp.amount} ({exp.category})
            </span>
            <button
              onClick={() => handleDelete(exp._id, "expense")}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Income List */}
      <h2 className="text-xl font-semibold mb-2">Income</h2>
      <ul className="space-y-2">
        {income.map((inc) => (
          <li
            key={inc._id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>
              {inc.title} - ₹{inc.amount} ({inc.category})
            </span>
            <button
              onClick={() => handleDelete(inc._id, "income")}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseTracker;
