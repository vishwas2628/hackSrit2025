// backend/src/controllers/userController.js
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

// Signup
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      const missingFields = [];
      if (!username) missingFields.push("Username is required");
      if (!email) missingFields.push("Email is required");
      if (!password) missingFields.push("Password is required");

      return res.status(400).json({
        error: "Validation failed",
        details: missingFields,
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new ApiError(400, "Email already exists");
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new ApiError(400, "Username already exists");
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      token,
      user: user.getSafeUserData(),
    });
  } catch (error) {
    console.error("Error in signup:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ error: "Validation failed", details: messages });
    }
    res.status(500).json({ error: "Failed to signup", details: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Find user by email and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      token,
      user: user.getSafeUserData(),
    });
  } catch (error) {
    console.error("Error in login:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to login", details: error.message });
  }
};

// Get User by ID
const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const authenticatedUserId = req.user.id; // From authMiddleware

    // Restrict access to the authenticated user only
    if (userId !== authenticatedUserId) {
      throw new ApiError(403, "You can only access your own user data");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      success: true,
      user: user.getSafeUserData(),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
  }
};

// Update User Details (for Q&A flow)

export { signup, login, getUser };
