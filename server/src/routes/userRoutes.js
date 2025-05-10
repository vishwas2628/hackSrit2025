// backend/src/routes/userRoutes.js
import express from "express";
import {
  signup,
  login,
  getUser,
  updateUser,
} from "../controllers/user.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/userid/:userId", authMiddleware, getUser);
router.put("/update", authMiddleware, updateUser);

export default router;
