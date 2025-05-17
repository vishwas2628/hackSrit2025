import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, error, isAuthenticated, loading } = useContext(AuthContext);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox change
  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Simple validation
    if (!formData.email || !formData.password) {
      setFormError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        navigate("/dashboard");
      } else {
        setFormError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#212121]">
      {/* Left Section */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center bg-[#212121] text-white p-8">
        <h1 className="text-2xl font-semibold mb-2">
          Log in to <span className="text-blue-500">FutureMap</span>
        </h1>
        <p className="text-sm mb-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Create an account
          </Link>
        </p>

        {/* Login Form */}
        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          {/* Show error message if any */}
          {(formError || error) && (
            <div className="mb-4 p-3 bg-red-900/70 border border-red-800 rounded text-white text-sm">
              {formError || error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={handleRememberMe}
                className="h-4 w-4 text-blue-500 rounded border-gray-600 bg-gray-700"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-gray-300"
              >
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={`w-full py-3 rounded font-semibold transition ${
              isSubmitting || loading
                ? "bg-blue-700/50 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isSubmitting || loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>

      {/* Right Section */}
      <div
        className="hidden sm:block sm:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${assets.login_background_dark})`,
        }}
      ></div>
    </div>
  );
};

export default Login;
