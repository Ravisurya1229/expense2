// src/api.js
const BASE_URL = "http://localhost:8000/api";

// Generic helper for API calls
const request = async (url, options = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.error ||
        errorData?.message ||
        `HTTP error! status: ${res.status}`
      );
    }
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};

// ---------- Auth ----------
export const loginUser = (credentials) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });

export const signupUser = (userData) =>
  request("/auth/signup", { method: "POST", body: JSON.stringify(userData) });

// ---------- Expenses (backend returns arrays/docs directly) ----------
export const fetchExpenses = (token) =>
  request("/expenses", { headers: { Authorization: `Bearer ${token}` } });

export const addExpense = (expense, token) =>
  request("/expenses", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(expense),
  });

export const deleteExpense = (id, token) =>
  request(`/expenses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

// ---------- Income (backend wraps data: { success, data }) ----------
// Normalize here so the rest of the app always gets arrays/docs directly
export const fetchIncome = (token) =>
  request("/income", { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res?.data ?? []); // <-- unwrap array

export const addIncome = (income, token) =>
  request("/income", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(income),
  }).then((res) => res?.data); // <-- unwrap created doc

export const deleteIncome = (id, token) =>
  request(`/income/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
