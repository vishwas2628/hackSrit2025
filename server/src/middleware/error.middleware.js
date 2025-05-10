import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let statusCode = 500;
  let message = "Something went wrong";
  let errors = [];

  // Handle mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map(e => e.message);
  }
  
  // Handle custom API errors
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }
  
  // Handle MongoDB connection errors
  else if (err.name === "MongoError" || err.name === "MongoServerError") {
    message = "Database Error";
    errors = [err.message];
  }
  
  // Handle Syntax errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = "Invalid JSON";
    errors = ["Please check your request format"];
  }

  // Log the error details for debugging
  console.error(`[${statusCode}] ${message}:`, errors.length ? errors : err.stack);

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors.length && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

export default errorHandler;
