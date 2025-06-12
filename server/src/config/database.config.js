// backend/src/config/database.config.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return mongoose.connection;
    }

    // Validate the MongoDB URL
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL not found in environment variables");
    }

    // Log the URL for debugging (remove in production)
    console.log("Connecting to MongoDB with URL:", mongoUrl);

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    // Connect to MongoDB
    const connectionInstance = await mongoose.connect(mongoUrl, options);
    console.log(
      `MongoDB connected! DB host: ${connectionInstance.connection.host}`
    );

    // Basic error handling for connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    return connectionInstance;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
