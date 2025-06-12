import express from "express";
import { getRecommendations } from "../controllers/recommendation.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, getRecommendations);

export default router;
