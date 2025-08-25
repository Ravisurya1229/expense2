// src/components/ExpenseTracker.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../utils/AuthContext";
import {
  fetchExpenses, addExpense, deleteExpense,
  fetchIncome,   addIncome,   deleteIncome
} from "../api";
import { BarCard, LineCard, PieCard } from "./ChartCard";

const EXPENSE_CATEGORIES = ["Food","Transport","Shopping","Bills","Entertainment","Other"];
const INCOME_CATEGORIES  = ["Salary","Business","Freelance","Investments","Gift","Other"];

export default function ExpenseTracker() {
  const { token } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome]     = useState([]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: ""
  });

  useEffect(() => {
    let mounted = true;
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const [exp, inc] = await Promise.all([
          fetchExpenses(token),
          fetchIncome(token),
        ]);
        if (!mounted) return;
        setExpenses(Array.isArray(exp) ? exp : []);
        setIncome(Array.isArray(inc) ? inc : []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    const { title, amount, category, type, date } = formData;

    if (!title || !amount || !category) {
      setError("All fields (except date) are required");
      return;
    }
    if (type === "expense" && !EXPENSE_CATEGORIES.includes(category)) {
      setError("Invalid expense category");
      return;
    }
    if (type === "income" && !INCOME_CATEGORIES.includes(category)) {
      setError("Invalid income category");
      return;
    }

    try {
      const amt = Number(amount);
      if (!Number.isFinite(amt)) {
        setError("Amount must be a number");
        return;
      }
      const payload = {
        title: String(title).trim(),
        amount: amt,
        category,
      };
      if (date) payload.date = new Date(date).toISOString();

      console.log("[FE] about to send", { type, payload });

      if (type === "expense") {
        const saved = await addExpense(payload, token);
        if (!saved || !saved._id) throw new Error("Failed to create expense");
        setExpenses(prev => [saved, ...prev]);
      } else {
        const saved = await addIncome(payload, token);
        if (!saved || !saved._id) throw new Error("Failed to create income");
        setIncome(prev => [saved, ...prev]);
      }

      setFormData({ title: "", amount: "", category: "", type: "expense", date: "" });
    } catch (err) {
      setError(err.message || "Failed to add entry");
    }
  };

  const handleDelete = async (id, type) => {
    setError("");
    try {
      if (type === "expense") {
        await deleteExpense(id, token);
        setExpenses(prev => prev.filter(e => e._id !== id));
      } else {
        await deleteIncome(id, token);
        setIncome(prev => prev.filter(i => i._id !== id));
      }
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + (e?.amount || 0), 0), [expenses]
  );
  const totalIncome = useMemo(
    () => income.reduce((s, i) => s + (i?.amount || 0), 0), [income]
  );

  const categoryPie = useMemo(() => {
    const map = new Map();
    expenses.forEach(e => {
      const key = e?.category || "Other";
      map.set(key, (map.get(key) || 0) + (e?.amount || 0));
    });
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }, [expenses]);

  const monthlyLine = useMemo(() => {
    const agg = new Map();
    income.forEach(i => {
      const k = (i?.date || "").slice(0,7);
      if (!k) return;
      agg.set(k, (agg.get(k) || 0) + (i?.amount || 0));
    });
    expenses.forEach(e => {
      const k = (e?.date || "").slice(0,7);
      if (!k) return;
      agg.set(k, (agg.get(k) || 0) - (e?.amount || 0));
    });
    return [...agg.entries()]
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value: +Number(value).toFixed(2) }));
  }, [income, expenses]);

  const totalsBar = useMemo(() => ([
    { label: "Income",  value: +totalIncome.toFixed(2) },
    { label: "Expenses", value: +totalExpenses.toFixed(2) },
  ]), [totalIncome, totalExpenses]);

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="border p-2 rounded"
        />
        {formData.type === "expense" ? (
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="" disabled>Select category</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="" disabled>Select category</option>
            {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value, category: "" })}
          className="border p-2 rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white rounded px-4 disabled:opacity-60"
          disabled={loading}
        >
          Add
        </button>
      </form>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Expenses</h2>
          <ul className="space-y-2">
            {expenses.map(e => (
              <li key={e._id} className="flex justify-between items-center border p-2 rounded">
                <span>{e.title} — ₹{e.amount} <span className="text-slate-500">({e.category})</span></span>
                <button onClick={() => handleDelete(e._id, "expense")} className="text-red-500">Delete</button>
              </li>
            ))}
            {!expenses.length && <li className="text-sm text-slate-500">No expenses yet.</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Income</h2>
          <ul className="space-y-2">
            {income.map(i => (
              <li key={i._id} className="flex justify-between items-center border p-2 rounded">
                <span>{i.title} — ₹{i.amount} <span className="text-slate-500">({i.category})</span></span>
                <button onClick={() => handleDelete(i._id, "income")} className="text-red-500">Delete</button>
              </li>
            ))}
            {!income.length && <li className="text-sm text-slate-500">No income yet.</li>}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PieCard title="Expenses by Category" data={categoryPie} valueKey="value" />
        <LineCard title="Monthly Balance (Income - Expenses)" data={monthlyLine} dataKey="value" />
        <BarCard  title="Totals" data={totalsBar} dataKey="value" />
      </div>
    </div>
  );
}
