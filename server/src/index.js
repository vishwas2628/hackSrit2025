import { app } from "./app.js";
import dotenv from "dotenv";

import connectDB from "./config/database.config.js";

dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 8001;

connectDB().then(() => {
  app.l;
});
