// Import mongoose to connect to MongoDB
import mongoose from "mongoose";

// Import dotenv to load environment variables from .env file
import dotenv from "dotenv";

// Load environment variables (ensure they're loaded regardless of environment)
dotenv.config();

// Get MongoDB credentials and database info from environment variables
const username = encodeURIComponent(process.env.MONGODB_USER_NAME || ""); // MongoDB username
const password = encodeURIComponent(process.env.MONGODB_PASSWORD || ""); // MongoDB password
const cluster = process.env.MONGODB_CLUSTER || "cluster0"; // Cluster name
const dbName = process.env.MONGODB_DATABASE || "ecommerceDB"; // Database name

// Construct the MongoDB connection URI ensuring all parts are included
const uri = `mongodb+srv://${username}:${password}@${cluster}.hzrxouj.mongodb.net/${dbName}?retryWrites=true&w=majority`;

// Log connection info (without credentials) for debugging
console.log(`Attempting to connect to MongoDB database: ${dbName} on cluster: ${cluster}`);

// Mongoose connection options
const options = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
};

/**
 * Connects to the MongoDB database using Mongoose and the provided URI and credentials.
 * @returns A promise that resolves to the mongoose connection
 */
export async function connectDB() {
  try {
    // Verify that we have the required credentials before attempting connection
    if (!username || !password) {
      throw new Error("MongoDB credentials are missing. Check your environment variables.");
    }

    await mongoose.connect(uri, options);
    console.log(`MongoDB connected successfully to ${dbName}`);
    return mongoose.connection.db;
  } catch (err) {
    // Log and rethrow connection errors
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
