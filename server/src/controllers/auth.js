import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      const missingFields = [];
      if (!username) missingFields.push("Username is required");
      if (!email) missingFields.push("Email is required");
      if (!password) missingFields.push("Password is required");

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: missingFields,
      });
    }

    // Check if user already exists - email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Return user data without password and security fields
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

/**
 * Verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyToken = async (req, res) => {
  try {
    // The user data is already attached to req.user by the auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
      error: error.message,
    });
  }
};

/**
 * Get current user data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving user data",
      error: error.message,
    });
  }
};

// Create authController object with all methods
const authController = {
  register,
  login,
  verifyToken,
  getMe,
};

// Export both individual functions and the authController object
export { register, login, verifyToken, getMe, authController };
