import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      setError("All fields are required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await signupUser({ email, password });
      if (res.message) {
        navigate("/login"); // go to login after successful signup
      } else {
        setError(res.error || "Signup failed");
      }
    } catch (err) {
      setError("Server error, try again later");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="w-full p-2 border rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          <input
            type="password"
            className="w-full p-2 border rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <input
            type="password"
            className="w-full p-2 border rounded mb-6"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
          />
          <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition">
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
