import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./utils/AuthContext";
import { useContext } from "react";

import AppShell from "./components/AppShell";
import ExpenseTracker from "./components/ExpenseTracker";
import Login from "./components/Login";
import Signup from "./components/Signup";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <ExpenseTracker />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
