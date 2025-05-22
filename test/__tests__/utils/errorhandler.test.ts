import { describe, it, expect } from "vitest";
import ErrorHandler from "../../../utils/errorhandler";

describe("ErrorHandler", () => {
  it("should create an error with a message and status code", () => {
    const message = "Not found";
    const statusCode = 404;
    
    const error = new ErrorHandler(message, statusCode);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });
  
  it("should capture stack trace", () => {
    const error = new ErrorHandler("Server error", 500);
    
    // Stack trace should be captured
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe("string");
  });
  
  it("should handle different status codes", () => {
    const badRequestError = new ErrorHandler("Bad request", 400);
    expect(badRequestError.statusCode).toBe(400);
    
    const unauthorizedError = new ErrorHandler("Unauthorized", 401);
    expect(unauthorizedError.statusCode).toBe(401);
    
    const internalServerError = new ErrorHandler("Internal server error", 500);
    expect(internalServerError.statusCode).toBe(500);
  });
  
  it("should be throwable and catchable", () => {
    const throwErrorFn = () => {
      throw new ErrorHandler("Permission denied", 403);
    };
    
    expect(throwErrorFn).toThrow();
    
    try {
      throwErrorFn();
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorHandler);
      if (error instanceof ErrorHandler) {
        expect(error.message).toBe("Permission denied");
        expect(error.statusCode).toBe(403);
      }
    }
  });
});