import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
const protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and follows Bearer token pattern
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from Authorization header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user ID to request object (without password)
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }
};

/**
 * Middleware to restrict access to certain roles
 * Must be used after the protect middleware
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get user from database to check role
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user role is allowed
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `User role '${user.role}' is not authorized to access this route`,
        });
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during role verification",
      });
    }
  };
};

// Export the middleware functions
export { protect, authorize };
