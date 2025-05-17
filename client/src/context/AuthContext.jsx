import React, { createContext, useState, useEffect } from "react";

// Create the authentication context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is already logged in (token exists)
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Try to get user data using the token
          const response = await fetch(
            "http://localhost:8001/api/user/verify",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token");
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Token verification error:", error);
          setError("Authentication failed. Please login again.");
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8001/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (username, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8001/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Automatically log in after successful registration
        return login(email, password);
      } else {
        setError(data.message || "Registration failed. Please try again.");
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred during signup. Please try again.");
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
