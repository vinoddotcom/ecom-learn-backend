import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorhandler";
import catchAsyncErrors from "./catchAsyncErrors";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
// Using module augmentation instead of namespace
declare module "express" {
  interface Request {
    user?: IUser;
  }
}

// Middleware to check if the user is authenticated
export const isAuthenticatedUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.cookies;

    if (!token) {
      return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
      // Verify the JWT token
      const decodedData = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Find the user and attach to request
      const user = await User.findById(decodedData.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      req.user = user;
      next();
    } catch {
      // No need to capture the error if we're not using it
      return next(new ErrorHandler("Invalid or expired token", 401));
    }
  }
);

// Middleware to authorize user roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403)
      );
    }

    next();
  };
};
