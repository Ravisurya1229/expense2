// src/utils/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser  = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials); // { token, user }
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    localStorage.setItem("token", res.token);
    navigate("/dashboard");
  };

  const signup = async (payload) => {
    // backend returns only { success, message } → go to login
    await signupUser(payload);
    navigate("/login");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
