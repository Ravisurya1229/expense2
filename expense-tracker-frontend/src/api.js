// src/api.js
const BASE_URL = "http://localhost:8000/api";

// Generic helper for API calls
const request = async (url, options = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};

// Expenses
export const fetchExpenses = () => request("/expenses");
export const addExpense = (expense) =>
  request("/expenses", {
    method: "POST",
    body: JSON.stringify(expense),
  });
export const deleteExpense = (id) =>
  request(`/expenses/${id}`, { method: "DELETE" });

// Income
export const fetchIncome = () => request("/income");
export const addIncome = (income) =>
  request("/income", {
    method: "POST",
    body: JSON.stringify(income),
  });
export const deleteIncome = (id) =>
  request(`/income/${id}`, { method: "DELETE" });
