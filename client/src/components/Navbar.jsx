import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import assets from "../assets/assets";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Navigation items array - reusable for both desktop and mobile menus
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Career Planning", path: "/career-planning" },
    { name: "Internship", path: "/internship" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md transition duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <img
              className="h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 transition"
              src={assets.logobg}
              alt="User"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              FuturePath
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex space-x-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <button>
            <Link
              to="/login"
              className="text-gray-600 bg-blue-800 p-3 rounded-md  dark:text-gray-300 hover:bg-blue-900 font-medium transition"
            >
              Login
            </Link>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-gray-600 dark:text-gray-300 hover:text-yellow-400 p-2 rounded-full focus:outline-none transition"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden px-4 pb-3 pt-2 space-y-2">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="block text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
