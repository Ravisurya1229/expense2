import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      if (res.token) {
        localStorage.setItem("token", res.token); // save JWT
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/dashboard"); // redirect
      } else {
        setError(res.error || "Login failed");
      }
    } catch (err) {
      setError("Server error, try again later");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter your email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-6"
            placeholder="Enter your password"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
