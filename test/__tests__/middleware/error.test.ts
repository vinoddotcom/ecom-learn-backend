import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response } from "express";
import errorMiddleware from "../../../middleware/error";
import ErrorHandler from "../../../utils/errorhandler";

// Mock Express Response
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("Error Middleware", () => {
  let req: Partial<Request>;
  let res: Response;

  beforeEach(() => {
    // Reset and setup mocks before each test
    vi.clearAllMocks();

    // Setup Express objects
    req = {};
    res = mockResponse();

    // Mock process.env for development/production toggling
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should handle custom ErrorHandler errors", () => {
    // Create a custom error
    const error = new ErrorHandler("Custom error message", 422);

    // Call middleware
    errorMiddleware(error, req as Request, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Custom error message",
      stack: expect.any(String), // Stack trace included in development
    });
  });

  test("should handle MongoDB CastError", () => {
    // Create a CastError
    const error = new Error("Cast error") as any;
    error.name = "CastError";
    error.path = "_id";

    // Call middleware
    errorMiddleware(error, req as Request, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resource not found. Invalid: _id",
      stack: expect.any(String),
    });
  });

  test("should handle MongoDB duplicate key error", () => {
    // Create a duplicate key error
    const error = new Error("Duplicate key error") as any;
    error.code = 11000;
    error.keyValue = { email: "test@example.com" };

    // Call middleware
    errorMiddleware(error, req as Request, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Duplicate email entered",
      stack: expect.any(String),
    });
  });

  test("should handle JWT validation error", () => {
    // Create a JWT error
    const error = new Error("JWT error") as any;
    error.name = "JsonWebTokenError";

    // Call middleware
    errorMiddleware(error, req as Request, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "JSON Web Token is invalid. Try again",
      stack: expect.any(String),
    });
  });

  test("should handle JWT expiration error", () => {
    // Create a JWT expiration error
    const error = new Error("Token expired") as any;
    error.name = "TokenExpiredError";

    // Call middleware
    errorMiddleware(error, req as Request, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "JSON Web Token is expired. Try again",
      stack: expect.any(String),
    });
  });

  test("should handle unknown errors with default 500 status", () => {
    // Create a generic error
    const error = new Error("Some unexpected error");

    // Call middleware
    errorMiddleware(error, req as Request, res);

    // Verify response uses default values
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      stack: expect.any(String),
    });
  });

  test("should hide stack trace in production environment", () => {
    // Set environment to production
    vi.stubEnv("NODE_ENV", "production");

    // Create an error
    const error = new Error("Production error");

    // Call middleware
    errorMiddleware(error, req as Request, res);

    // Verify response doesn't include stack in production
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      stack: undefined,
    });
  });
});
