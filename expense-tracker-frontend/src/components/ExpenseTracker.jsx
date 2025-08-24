// src/components/ExpenseTracker.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../utils/AuthContext";
import {
  fetchExpenses, addExpense, deleteExpense,
  fetchIncome,   addIncome,   deleteIncome
} from "../api";
import { BarCard, LineCard, PieCard } from "./ChartCard";

export default function ExpenseTracker() {
  const { token } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome]     = useState([]);
  const [formData, setFormData] = useState({
    title: "", amount: "", category: "", type: "expense"
  });

  // Load data
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [exp, inc] = await Promise.all([
          fetchExpenses(token), // array
          fetchIncome(token),   // array (normalized in api.js)
        ]);
        setExpenses(exp);
        setIncome(inc);
      } catch (err) {
        console.error("Load failed:", err);
      }
    })();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const { title, amount, category, type } = formData;
    if (!title || !amount || !category) return alert("All fields required");
    try {
      if (type === "expense") {
        const saved = await addExpense({ title, amount: +amount, category }, token); // doc
        setExpenses(prev => [saved, ...prev]);
      } else {
        const saved = await addIncome({ title, amount: +amount, category }, token); // doc (normalized)
        setIncome(prev => [saved, ...prev]);
      }
      setFormData({ title: "", amount: "", category: "", type: "expense" });
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === "expense") {
        await deleteExpense(id, token);
        setExpenses(prev => prev.filter(e => e._id !== id));
      } else {
        await deleteIncome(id, token);
        setIncome(prev => prev.filter(i => i._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ---------- Charts data ----------
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + (e?.amount || 0), 0), [expenses]
  );
  const totalIncome = useMemo(
    () => income.reduce((s, i) => s + (i?.amount || 0), 0), [income]
  );

  // Pie: category-wise expenses
  const categoryPie = useMemo(() => {
    const map = new Map();
    expenses.forEach(e => {
      const key = e?.category || "Other";
      map.set(key, (map.get(key) || 0) + (e?.amount || 0));
    });
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }, [expenses]);

  // Line: monthly balance (income - expenses)
  const monthlyLine = useMemo(() => {
    const agg = new Map(); // key: YYYY-MM
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

  // Bar: totals income vs expenses
  const totalsBar = useMemo(() => ([
    { label: "Income",  value: +totalIncome.toFixed(2) },
    { label: "Expenses", value: +totalExpenses.toFixed(2) },
  ]), [totalIncome, totalExpenses]);

  return (
    <div className="space-y-8">
      {/* Add form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
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
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4">Add</button>
      </form>

      {/* Lists */}
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
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PieCard title="Expenses by Category" data={categoryPie} valueKey="value" />
        <LineCard title="Monthly Balance (Income - Expenses)" data={monthlyLine} dataKey="value" />
        <BarCard  title="Totals" data={totalsBar} dataKey="value" />
      </div>
    </div>
  );
}
