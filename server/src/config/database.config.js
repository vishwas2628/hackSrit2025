import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Track connection status
let connectionStatus = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;

/**
 * Check if MongoDB is connected
 * @returns {boolean} Connection status
 */
export const isDbConnected = () => {
  return connectionStatus && mongoose.connection.readyState === 1;
};

// /**
//  * Connect to MongoDB database with retry logic
//  * @returns {Promise<mongoose.Connection>} Mongoose connection
//  */
const connectDB = async () => {
  try {
    // Skip if already connected
    if (isDbConnected()) {
      console.log("Already connected to MongoDB");
      return mongoose.connection;
    }

    // Connection options with recommended settings for Mongoose 8.x
    const options = {
      // Timeout settings
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 30000,        // 30 seconds
      socketTimeoutMS: 45000,         // 45 seconds
      
      // Connection pool settings
      maxPoolSize: 10,  // Max number of connections
      minPoolSize: 1,   // Min number of connections
    };

    // Validate the connection URL to prevent common errors
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MongoDB URL not found in environment variables. Please set MONGODB_URL.");
    }
    
    // Create proper connection URL format
    const connectionString = mongoUrl.includes('?') 
      ? `${mongoUrl}/${DB_NAME}`
      : `${mongoUrl}/${DB_NAME}?retryWrites=true&w=majority`;
    
    // Connect to MongoDB
    const connectionInstance = await mongoose.connect(connectionString, options);

    // Set connection status after successful connection
    connectionStatus = true;
    connectionRetries = 0; // Reset retry counter

    console.log(
      `MongoDB connected! DB host: ${connectionInstance.connection.host}`
    );

    // Set up event listeners for connection state changes
    mongoose.connection.on("connected", () => {
      connectionStatus = true;
      console.log("MongoDB connection established");
    });

    mongoose.connection.on("disconnected", () => {
      connectionStatus = false;
      console.log("MongoDB disconnected");

      // Attempt to reconnect after a delay if not shutting down
      if (global.isShuttingDown !== true) {
        setTimeout(() => {
          console.log("Attempting to reconnect to MongoDB...");
          connectDB().catch((err) =>
            console.error("Reconnection attempt failed:", err.message)
          );
        }, 5000); // Wait 5 seconds before trying again
      }
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      connectionStatus = false;
    });

    return connectionInstance;
  } catch (error) {
    connectionStatus = false;

    // Provide specific error messages based on error type
    if (error.name === "MongoServerSelectionError") {
      console.error(
        "Could not connect to MongoDB server. Please check if the server is running and the connection URL is correct."
      );
    } else if (error.name === "MongoParseError") {
      console.error("Invalid MongoDB connection string format:", error.message);
    } else {
      console.error("MongoDB connection error:", error.message);
    }

    // Implement retry logic with exponential backoff
    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      const retryDelay = Math.min(1000 * Math.pow(2, connectionRetries), 30000);

      console.log(
        `Retrying connection (${connectionRetries}/${MAX_RETRIES}) in ${
          retryDelay / 1000
        } seconds...`
      );

      // Return promise that will retry after delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(connectDB());
        }, retryDelay);
      });
    }

    // If we've exhausted retries, throw the error for the caller to handle
    throw error;
  }
};

export default connectDB;
