// Import mongoose to connect to MongoDB
import mongoose from "mongoose";

// Import dotenv to load environment variables from .env file
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get MongoDB credentials and database info from environment variables
const username = encodeURIComponent(process.env.MONGODB_USER_NAME || ""); // MongoDB username
const password = encodeURIComponent(process.env.MONGODB_PASSWORD || ""); // MongoDB password
const dbName = process.env.MONGODB_DATABASE || "ecommerceDB"; // Database name (will be created automatically when needed)

// Construct the MongoDB connection URI
const uri = `mongodb+srv://${username}:${password}@cluster0.hzrxouj.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

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
    await mongoose.connect(uri, options);
    console.log(`MongoDB connected successfully to ${dbName}`);
    return mongoose.connection.db;
  } catch (err) {
    // Log and rethrow connection errors
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
