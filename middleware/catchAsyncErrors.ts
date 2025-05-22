import { Request, Response, NextFunction } from "express";

// Higher order function that wraps an async controller function to catch errors
const catchAsyncErrors = 
  (func: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(func(req, res, next)).catch(next);
};

export default catchAsyncErrors;