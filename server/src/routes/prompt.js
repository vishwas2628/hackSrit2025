import express from "express";
import {
  submitPrompt,
  getAllInputs,
} from "../controllers/prompt.controllers.js";

const router = express.Router();

router.post("/submit", submitPrompt);
router.get("/inputs", getAllInputs);

export default router;
