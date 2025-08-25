// src/api.js
const BASE_URL = "http://localhost:8000/api";

// Generic helper for API calls
const request = async (url, options = {}) => {
  try {
    // IMPORTANT: spread options first, then build merged headers so
    // we don't lose Content-Type when options.headers exists.
    const init = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      // mode: "cors", // optional; fetch defaults to CORS for cross-origin
    };

    const res = await fetch(`${BASE_URL}${url}`, init);

    if (!res.ok) {
      // try to extract server error payload
      const errorData = await res.json().catch(() => null);
      const msg =
        errorData?.error ||
        errorData?.message ||
        `HTTP error! status: ${res.status}`;

      // If backend sends details, add them to the message to help debugging
      const details = errorData?.details ? ` (${errorData.details})` : "";
      throw new Error(`${msg}${details}`);
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

// ---------- Expenses ----------
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

// ---------- Income (mirror backend: returns raw docs/arrays) ----------
export const fetchIncome = (token) =>
  request("/income", { headers: { Authorization: `Bearer ${token}` } });

export const addIncome = (income, token) =>
  request("/income", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(income),
  });

export const deleteIncome = (id, token) =>
  request(`/income/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
