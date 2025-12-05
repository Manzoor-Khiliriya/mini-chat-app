import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { login } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react"; // Importing an icon for a better look

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      
      // Assuming a successful response means the user object is available
      // The setUser logic is simplified, assuming 'res' contains the user object or a nested 'user' field
      setUser(res.user || res.data?.user || res); 
      navigate("/");

    } catch (err) {
      // Improved, robust error extraction
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm transition-colors"
      >
        <div className="flex flex-col items-center mb-6">
          <LogIn size={32} className="text-blue-500 mb-2" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <p className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg mb-4 text-center border border-red-200">
            {error}
          </p>
        )}

        {/* Username Input */}
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Enter your username"
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={loading}
        />

        {/* Password Input */}
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={loading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !form.username || !form.password}
          className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 
            ${
              loading || !form.username || !form.password
                ? "bg-blue-400 dark:bg-blue-600 cursor-not-allowed opacity-70"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            }`}
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <LogIn size={20} />
          )}
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Sign-up Link */}
        <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
          Don't have an account?
          <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium ml-1 transition-colors">
            Sign up now
          </Link>
        </p>
      </form>
    </div>
  );
}