// backend/src/routes/userRoutes.js
import express from "express";
import { signup, login, getUser } from "../controllers/user.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Removed duplicate signup route - use /api/auth/signup instead
router.post("/login", login);
router.get("/userid/:userId", authMiddleware, getUser);

export default router;
