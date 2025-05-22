import { describe, test, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import catchAsyncErrors from "../../../middleware/catchAsyncErrors";

describe("catchAsyncErrors Middleware", () => {
  test("should pass through if no error occurs", async () => {
    // Mock Express objects
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    // Create a mock controller function that doesn't throw an error
    const controllerFunction = vi.fn().mockResolvedValue("success");

    // Wrap with catchAsyncErrors
    const wrappedFunction = catchAsyncErrors(controllerFunction);

    // Execute the wrapped function
    await wrappedFunction(req, res, next);

    // Expectations
    expect(controllerFunction).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled(); // next should not be called if no error
  });

  test("should call next with error when async function throws", async () => {
    // Mock Express objects
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    // Create a mock error
    const testError = new Error("Test error");

    // Create a mock controller function that throws an error
    const controllerFunction = vi.fn().mockRejectedValue(testError);

    // Wrap with catchAsyncErrors
    const wrappedFunction = catchAsyncErrors(controllerFunction);

    // Execute the wrapped function
    await wrappedFunction(req, res, next);

    // Expectations
    expect(controllerFunction).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(testError);
  });
});
