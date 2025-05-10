// backend/src/controllers/userController.js
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

// Signup
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    // Generate JWT token
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
    // Check if it's a Mongoose validation error
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

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Find user by email
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
    res.status(500).json({ error: "Failed to login" });
  }
};

// Get User by ID
const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;

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
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update User Details (for Q&A flow)
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const {
      firstName,
      educationLevel,
      fields,
      experience,
      birthDate,
      location,
      streetAddress,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (educationLevel) user.educationLevel = educationLevel;
    if (fields) user.fields = fields;
    if (experience !== undefined) user.experience = Number(experience);
    if (birthDate) user.birthDate = new Date(birthDate);
    if (location) user.location = location;
    if (streetAddress) user.streetAddress = streetAddress;

    await user.save();

    res.json({
      success: true,
      user: user.getSafeUserData(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
};

export { signup, login, getUser, updateUser };
