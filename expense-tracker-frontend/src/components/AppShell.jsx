import { Moon, Sun, User } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";

export default function AppShell({ children }) {
  const [dark, setDark] = useState(true);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500" />
            <span className="font-semibold text-slate-900 dark:text-white tracking-tight">Expenza</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name || user?.email || "User"}</span>
                {user?.phone ? (
                  <span className="text-xs opacity-70 hidden sm:inline"> · {user.phone}</span>
                ) : null}
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      <footer className="mt-10 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Expenza — All rights reserved.
      </footer>
    </div>
  );
}
