import app from "./app";
import { connectDB } from "./config/database";
// We're importing cloudinary but not configuring it here anymore
// as it's already configured in ./utils/cloudinary.ts
import "./utils/cloudinary";

// Handling Uncaught Exception
process.on("uncaughtException", (err: unknown) => {
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.log(`Error: ${errorMessage}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Config
import dotenv from "dotenv";

// Define a type for the environment
// type NodeEnv = "development" | "production" | "test" | "PRODUCTION";

// Load environment variables
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config();
}

// Connecting to database
connectDB();

const PORT = process.env.PORT || "4000";
const server = app.listen(parseInt(PORT), () => {
  console.log(`Server is working on http://localhost:${PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err: unknown) => {
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.log(`Error: ${errorMessage}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
