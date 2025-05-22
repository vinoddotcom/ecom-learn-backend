import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper for async handlers
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Configure middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cors()); // Enable CORS for all routes

// Define port
const PORT = process.env.PORT || 5000;

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running..." });
});

// Import models
import User from "./models/userModel";
import Product from "./models/productModel";
import Order from "./models/orderModel";

// Error middleware
const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.code === 11000) {
    err.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err.statusCode = 400;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// Test database connection and retrieve model counts
app.get("/api/test-db", async (req, res) => {
  try {
    await connectDB();

    // Get counts from each collection
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    res.status(200).json({
      message: "Database test successful",
      collections: {
        users: userCount,
        products: productCount,
        orders: orderCount,
      },
    });
  } catch (error: any) {
    console.error("Database test failed:", error);
    res.status(500).json({ message: "Database test failed", error: error.message });
  }
});

// Start server and connect to database
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log(`Connected to MongoDB cluster successfully`);

    // Setup JWT Secret if missing
    if (!process.env.JWT_SECRET) {
      console.warn(
        "JWT_SECRET not found in environment variables. Using a default secret (not recommended for production)."
      );
      process.env.JWT_SECRET = "default_jwt_secret_replace_in_production_e9437a";
    }

    // Setup JWT expiration if missing
    if (!process.env.JWT_EXPIRE) {
      console.warn("JWT_EXPIRE not found in environment variables. Using default of 7 days.");
      process.env.JWT_EXPIRE = "7d";
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Error handling middleware - must be the last middleware to register
app.use(errorMiddleware);

// Initialize the server
startServer();
