import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorhandler";

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface CastError extends Error {
  path?: string;
}

interface JWTError extends Error {
  name: string;
}

// Express error middleware requires 4 parameters even if we don't use next
const errorMiddleware = (
  err: Error | ErrorHandler | MongoError | CastError | JWTError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  // If it's our custom error handler, use its properties
  if (err instanceof ErrorHandler) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Handle specific error types

    // Wrong MongoDB Id error (CastError)
    if (err.name === "CastError") {
      const castErr = err as CastError;
      message = `Resource not found. Invalid: ${castErr.path}`;
      statusCode = 400;
    }

    // Mongoose duplicate key error
    if ("code" in err && err.code === 11000) {
      const mongoErr = err as MongoError;
      message = `Duplicate ${Object.keys(mongoErr.keyValue || {}).join(", ")} entered`;
      statusCode = 400;
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
      message = "JSON Web Token is invalid. Try again";
      statusCode = 401;
    }

    // JWT expired error
    if (err.name === "TokenExpiredError") {
      message = "JSON Web Token is expired. Try again";
      statusCode = 401;
    }
  }

  // Check if response is valid and has not been sent
  if (res && typeof res.status === "function" && !res.headersSent) {
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } else {
    // Log error if response is invalid or already sent
    console.error("Error in error middleware:", err);
    if (next) next(err); // Pass error to default Express error handler
  }
};

export default errorMiddleware;
