import app from "./app";
import { connectDB } from "./config/database";
// We're importing cloudinary but not configuring it here anymore
// as it's already configured in ./utils/cloudinary.ts
import "./utils/cloudinary";
import dotenv from "dotenv";

// Load environment variables regardless of environment
dotenv.config();

// Handling Uncaught Exception
process.on("uncaughtException", (err: unknown) => {
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.log(`Error: ${errorMessage}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Connecting to database
connectDB();

const PORT = process.env.PORT || "8000";
const HOST = "0.0.0.0"; // Add this line

const server = app.listen(parseInt(PORT), HOST, () => {
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : PORT;
  console.log(`Server is working on http://${HOST}:${actualPort}`);
});
// Define a route for the root path
app.get("/", (req, res) => {
  res.send("<html><body><h1>Hello World</h1></body></html>");
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
