import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { logout } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut } from "lucide-react";

export default function Header() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <div
          className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate("/")}
        >
          Mini Chat
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-gray-700 dark:text-gray-300 text-sm font-medium">
              {user.username}
            </span>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}