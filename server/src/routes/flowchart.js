import express from "express";
import { getFlowchartData } from "../controllers/flowchart.controllers.js";

const router = express.Router();

router.get("/data", getFlowchartData);

export default router;
