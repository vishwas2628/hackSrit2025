import express from "express";
const router = express.Router();
import { authController } from "../controllers/auth.js";

import { protect } from "../middleware/auth.js";

// Public routes
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", authController.login);

// Protected routes
/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and return user data
 * @access  Private
 */
router.get("/verify", protect, authController.verifyToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", protect, authController.getMe);

export default router;
