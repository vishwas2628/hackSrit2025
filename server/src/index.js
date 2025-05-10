// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import net from "net";
import connectDB from "./config/database.config.js";
import promptRoutes from "./routes/prompt.js";
import flowchartRoutes from "./routes/flowchart.js";
import errorHandler from "./middleware/error.middleware.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Essential middleware
app.use(cors());
app.use(express.json({ limit: "1mb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

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

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

/**
 * Check if a port is available
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
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

/**
 * Find an available port starting from the given port
 * @param {number} startPort - Starting port to check
 * @param {number} maxAttempts - Maximum number of ports to try
 * @returns {Promise<number>} - Available port or -1 if none found
 */
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
const FALLBACK_PORTS = [3000, 3001, 5000, 8000, 8080];
let server;
// Connect to database then start server
const startServer = async () => {
  try {
    // Connect to the database first
    await connectDB();

    // Only start server if database is connected
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
