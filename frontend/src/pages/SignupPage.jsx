import React, { useState, useContext } from "react";
import { signup } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react"; // Icon for modern UI

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signup(form);
      
      // Improved: Use the same comprehensive logic as the catch block below
      // to handle success/failure based on the response structure
      
      // Assuming a successful response means the user object is available
      setUser(res.user || res.data?.user || res); 
      navigate("/");

    } catch (err) {
      // Robust error extraction logic
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Signup failed. Please try again.";
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
          <UserPlus size={32} className="text-green-500 mb-2" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join Mini Chat
          </h2>
        </div>

        {/* Error Message with better visibility */}
        {error && (
          <p className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg mb-4 text-center border border-red-200">
            {error}
          </p>
        )}

        <input
          name="username"
          placeholder="Choose a Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          disabled={loading}
        />

        <input
          type="password"
          name="password"
          placeholder="Create a Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          disabled={loading}
        />

        <button
          type="submit"
          // Conditional disable based on loading and form content (UX improvement)
          disabled={loading || !form.username || !form.password}
          className={`w-full p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 
            ${
              loading || !form.username || !form.password
                ? "bg-green-400 dark:bg-green-600 cursor-not-allowed opacity-70"
                : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
            }`}
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <UserPlus size={20} />
          )}
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {/* Login link */}
        <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
          Already have an account?
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium ml-1 transition-colors">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}