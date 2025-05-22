import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isAuthenticatedUser, authorizeRoles } from "../../../middleware/auth";
import User from "../../../models/userModel";
import ErrorHandler from "../../../utils/errorhandler";

// Mocking external dependencies
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../../../models/userModel", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../../../utils/errorhandler", () => ({
  default: class ErrorHandler extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  // Define a more specific type for the next function that allows access to mock properties
  let next: NextFunction & { mock: { calls: any[][] } };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup common test variables
    req = {
      cookies: {},
      user: undefined,
    };
    res = {};
    // Create a mock function that can be used as NextFunction but also has mock properties
    next = vi.fn() as unknown as NextFunction & { mock: { calls: any[][] } };

    // Mock process.env.JWT_SECRET
    vi.stubEnv("JWT_SECRET", "test-secret-key");
  });

  afterEach(() => {
    // Clean up environment variables
    vi.unstubAllEnvs();
  });

  describe("isAuthenticatedUser", () => {
    test("should return 401 if no token is provided", async () => {
      // Execute middleware
      await isAuthenticatedUser(req as Request, res as Response, next);

      // Check that next was called with an error
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Please login to access this resource");
    });

    test("should return 401 if token verification fails", async () => {
      // Setup
      req.cookies.token = "invalid-token";
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      // Execute middleware
      await isAuthenticatedUser(req as Request, res as Response, next);

      // Verify error handling
      expect(jwt.verify).toHaveBeenCalledWith("invalid-token", "test-secret-key");
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Invalid or expired token");
    });

    test("should return 404 if user is not found", async () => {
      // Setup
      req.cookies.token = "valid-token";
      vi.mocked(jwt.verify).mockReturnValueOnce({ id: "user-id" } as any);
      vi.mocked(User.findById).mockResolvedValueOnce(null);

      // Execute middleware
      await isAuthenticatedUser(req as Request, res as Response, next);

      // Verify behavior
      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret-key");
      expect(User.findById).toHaveBeenCalledWith("user-id");
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("User not found");
    });

    test("should set req.user and call next() if authentication succeeds", async () => {
      // Setup
      req.cookies.token = "valid-token";
      const mockUser = { _id: "user-id", name: "Test User" };

      vi.mocked(jwt.verify).mockReturnValueOnce({ id: "user-id" } as any);
      vi.mocked(User.findById).mockResolvedValueOnce(mockUser as any);

      // Execute middleware
      await isAuthenticatedUser(req as Request, res as Response, next);

      // Verify successful authentication
      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret-key");
      expect(User.findById).toHaveBeenCalledWith("user-id");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no arguments
    });
  });

  describe("authorizeRoles", () => {
    test("should call next() if user has authorized role", () => {
      // Setup
      req.user = { role: "admin" } as any;
      const middleware = authorizeRoles("admin", "super-admin");

      // Execute middleware
      middleware(req as Request, res as Response, next);

      // Verify behavior
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no arguments
    });

    test("should return 401 if user is not authenticated", () => {
      // Setup
      req.user = undefined;
      const middleware = authorizeRoles("admin");

      // Execute middleware
      middleware(req as Request, res as Response, next);

      // Verify error handling
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("User not authenticated");
    });

    test("should return 403 if user role is not authorized", () => {
      // Setup
      req.user = { role: "user" } as any;
      const middleware = authorizeRoles("admin", "super-admin");

      // Execute middleware
      middleware(req as Request, res as Response, next);

      // Verify error handling
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe("Role: user is not allowed to access this resource");
    });
  });
});
