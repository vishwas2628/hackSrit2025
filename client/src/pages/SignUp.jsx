import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { AuthContext } from "../context/AuthContext.jsx";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signup, error, isAuthenticated, loading } = useContext(AuthContext);

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

  // Validate form inputs
  const validateForm = () => {
    setFormError("");

    // Name validation
    if (!formData.username.trim()) {
      setFormError("Name is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signup(
        formData.username,
        formData.email,
        formData.password
      );

      if (result.success) {
        navigate("/dashboard");
      } else {
        setFormError(result.error || "Registration failed. Please try again.");
        console.log(result.error);
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
          Sign up to <span className="text-blue-500">FutureMap</span>
        </h1>
        <p className="text-sm mb-8">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>

        {/* SignUp Form */}
        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          {/* Show error message if any */}
          {(formError || error) && (
            <div className="mb-4 p-3 bg-red-900/70 border border-red-800 rounded text-white text-sm">
              {formError || error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || loading}
              requireds
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
              minLength="6"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 bg-[#333333] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || loading}
              required
            />
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
            {isSubmitting || loading ? "Creating Account..." : "Sign Up"}
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

export default SignUp;
