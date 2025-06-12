import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
};

export default authMiddleware;
