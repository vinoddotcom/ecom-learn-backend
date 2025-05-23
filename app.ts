/**
 * Main Application Configuration
 * Sets up Express application with middleware and routes
 * @module app
 */

import express from "express";
// Swagger setup
import setupSwagger from "./setupSwagger";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import path from "path";
import dotenv from "dotenv";

// Import error middleware
import errorMiddleware from "./middleware/error";

// Import routes
import productRoutes from "./routes/productRoute";
import userRoutes from "./routes/userRoute";
import orderRoutes from "./routes/orderRoute";

const app = express();
// Setup Swagger API docs
setupSwagger(app);

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config();
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Apply Routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
}

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Middleware for Errors - should be last
app.use(errorMiddleware);

export default app;
