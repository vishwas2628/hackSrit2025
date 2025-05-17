import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import net from "net";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import connectDB from "./config/database.config.js";
import promptRoutes from "./routes/prompt.js";
import flowchartRoutes from "./routes/flowchart.js";
import errorHandler from "./middleware/error.middleware.js";
import userRoutes from "./routes/userRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import authRoutes from "./routes/auth.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enhanced security middleware
app.use(helmet()); // Adds various HTTP headers for security

// Configure CORS with more security options
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Apply rate limiting to all requests
app.use(apiLimiter);

// More strict rate limits for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 requests per hour for auth routes
  message: {
    status: 429,
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Essential middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Root route for health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API is running",
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// API routes
app.use("/api/prompt", promptRoutes);
app.use("/api/showChart", flowchartRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recommendation", recommendationRoutes);

//localhost:8001/api/auth/login

// Auth routes with stricter rate limiting
http: app.use("/api/user", authLimiter, authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle JWT authentication errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again.",
    });
  }

  // Pass to the default error handler
  next(err);
});

// Standard error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is already in use.`);
        resolve(false);
      } else {
        // Other error occurred
        console.error(`Error checking port ${port}:`, err.message);
        resolve(false);
      }
    });

    server.once("listening", () => {
      // Port is available, close the server and return true
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
};

// /**
//  * Find an available port starting from the given port
//  * @param {number} startPort - Starting port to check
//  * @param {number} maxAttempts - Maximum number of ports to try
//  * @returns {Promise<number>} - Available port or -1 if none found
//  */
const findAvailablePort = async (startPort, maxAttempts = 10) => {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  return -1;
};

// Start the server after connecting to MongoDB
const DEFAULT_PORT = process.env.PORT || 8001;
const FALLBACK_PORTS = 8001;
let server;

const startServer = async () => {
  try {
    await connectDB();

    if (mongoose.connection.readyState === 1) {
      let port = DEFAULT_PORT;

      // Check if default port is available
      if (!(await isPortAvailable(port))) {
        console.log(
          `Default port ${port} is in use. Trying to find an available port...`
        );

        // Try specified fallback ports first
        for (const fallbackPort of FALLBACK_PORTS) {
          if (await isPortAvailable(fallbackPort)) {
            port = fallbackPort;
            console.log(`Using fallback port ${port}`);
            break;
          }
        }

        // If all fallback ports are unavailable, find any available port
        if (!(await isPortAvailable(port))) {
          port = await findAvailablePort(3000, 20);

          if (port === -1) {
            throw new Error(
              "No available ports found. Please free up a port and try again."
            );
          }

          console.log(`Using dynamically assigned port ${port}`);
        }
      }

      // Start the server with the available port
      server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`You can access the API at http://localhost:${port}`);
      });

      // Handle server errors
      server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          console.error(
            `Port ${port} is already in use. Please choose another port.`
          );
        } else {
          console.error("Server error:", error.message);
        }
        process.exit(1);
      });

      // Handle graceful shutdown
      setupGracefulShutdown(server);
    } else {
      console.error("Failed to connect to database. Server not started.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

// Setup graceful shutdown for the server
const setupGracefulShutdown = (server) => {
  // Handle termination signals
  ["SIGTERM", "SIGINT"].forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}. Shutting down gracefully...`);

      // Create a force shutdown timeout
      const forceShutdownTimeout = setTimeout(() => {
        console.error(
          "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 10000);

      try {
        // Close HTTP server
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              console.error("Error closing HTTP server:", err);
              reject(err);
            } else {
              console.log("HTTP server closed.");
              resolve();
            }
          });
        });

        // Close database connection using await
        if (mongoose.connection.readyState !== 0) {
          // Check if connection is not closed
          await mongoose.connection.close();
          console.log("MongoDB connection closed.");
        }

        // Clear the force shutdown timeout
        clearTimeout(forceShutdownTimeout);
        console.log("All connections closed successfully.");
        process.exit(0);
      } catch (error) {
        console.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    });
  });
};
// Start the server
startServer();
