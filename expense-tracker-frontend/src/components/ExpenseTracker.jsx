import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  PlusCircle, DollarSign, TrendingUp, TrendingDown, Calendar, Search,
  Trash2, ArrowUpRight, ArrowDownRight, Filter
} from "lucide-react";
import { formatCurrency, idGen } from "../utils/format";
import { BarCard, LineCard, PieCard } from "./ChartCard";
import { AuthContext } from "../utils/AuthContext"; // <-- Added

const defaultSeed = [
  { id: 1, title: "Grocery Shopping", amount: 85.5, category: "Food", date: "2024-08-20", type: "expense" },
  { id: 2, title: "Salary", amount: 3500.0, category: "Income", date: "2024-08-20", type: "income" },
  { id: 3, title: "Coffee", amount: 4.5, category: "Food", date: "2024-08-19", type: "expense" },
  { id: 4, title: "Gas Station", amount: 45.0, category: "Transport", date: "2024-08-19", type: "expense" },
  { id: 5, title: "Netflix Subscription", amount: 12.99, category: "Entertainment", date: "2024-08-18", type: "expense" }
];

const categories = ["Food","Transport","Entertainment","Shopping","Bills","Health","Income"];

const categoryColors = {
  Food: "#ff6b6b",
  Transport: "#4d94ff",
  Entertainment: "#a64dff",
  Shopping: "#ff4da6",
  Bills: "#ff595e",
  Health: "#32d48e",
  Income: "#00c851"
};

export default function ExpenseTracker() {
  const { user, logout } = useContext(AuthContext); // <-- Added

  const [expenses, setExpenses] = useState(() => {
    try {
      const cached = localStorage.getItem("expenses:v1");
      return cached ? JSON.parse(cached) : defaultSeed;
    } catch {
      return defaultSeed;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [newExpense, setNewExpense] = useState({
    title: "", amount: "", category: "Food", type: "expense"
  });

  // persist
  useEffect(() => {
    localStorage.setItem("expenses:v1", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = () => {
    const title = newExpense.title.trim();
    const amount = parseFloat(newExpense.amount);
    if (!title || !Number.isFinite(amount) || amount <= 0) return;

    const item = {
      id: idGen(),
      title,
      amount,
      category: newExpense.category,
      date: new Date().toISOString().split("T")[0],
      type: newExpense.type
    };
    setExpenses((prev) => [item, ...prev]);
    setNewExpense({ title: "", amount: "", category: "Food", type: "expense" });
  };

  const deleteExpense = (id) => setExpenses((prev) => prev.filter((e) => e.id !== id));
  const onEnter = (e, action) => { if (e.key === "Enter") action(); };

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a,b) => (b.date + b.id).localeCompare(a.date + a.id)),
    [expenses]
  );

  const filteredExpenses = useMemo(() =>
    sortedExpenses.filter((exp) => {
      const s = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
      const c = filterCategory === "all" || exp.category === filterCategory;
      const t = filterType === "all" || exp.type === filterType;
      const f = !dateFrom || exp.date >= dateFrom;
      const to = !dateTo || exp.date <= dateTo;
      return s && c && t && f && to;
    }), [sortedExpenses, searchTerm, filterCategory, filterType, dateFrom, dateTo]
  );

  const totals = useMemo(() => {
    const income = expenses.filter(e => e.type==="income").reduce((s,e)=>s+e.amount,0);
    const spend  = expenses.filter(e => e.type==="expense").reduce((s,e)=>s+e.amount,0);
    return { totalIncome: income, totalExpenses: spend, balance: income - spend };
  }, [expenses]);

  const getCategoryColor = (category) => categoryColors[category] || "#6b7280";

  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      const k = e.category;
      const val = e.type === "expense" ? e.amount : 0;
      map[k] = (map[k] || 0) + val;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [expenses]);

  const byMonth = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      const key = e.date.slice(0,7);
      const sign = e.type === "income" ? 1 : -1;
      map[key] = (map[key] || 0) + sign * e.amount;
    });
    return Object.entries(map)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value: +value.toFixed(2) }));
  }, [expenses]);

  const balanceTrend = useMemo(() => {
    const days = [...new Set(expenses.map(e => e.date))].sort();
    let running = 0;
    return days.map(d => {
      expenses.filter(e=>e.date===d).forEach(e => running += (e.type==="income" ? e.amount : -e.amount));
      return { label: d.slice(5), value: +running.toFixed(2) };
    });
  }, [expenses]);

  return (
    <div>
      {/* Hero header */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Expense <span className="text-transparent bg-clip-text"
              style={{ background: "linear-gradient(45deg, #a64dff, #ff4da6)",
                       WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Tracker</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-300">Take control of your finances with style</p>
        </div>

        {/* User info and logout */}
        <div className="mt-4 sm:mt-0">
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-slate-300 text-sm">
                Signed in as <strong>{user.email}</strong>
              </span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ...rest of your component stays unchanged */}
      {/* Stats, Add Transaction, Filters, Transactions, Insights */}
      {/* (keep all the code you had after this header unchanged) */}
    </div>
  );
}
