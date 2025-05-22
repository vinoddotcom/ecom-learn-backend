import { Response } from "express";
import { IUser } from "../models/userModel";

// Create Token and saving in cookie
const sendToken = (user: IUser, statusCode: number, res: Response): void => {
  // Get token from user model instance  
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE ? 
        parseInt(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000 : 
        7 * 24 * 60 * 60 * 1000) // Default to 7 days if not specified
    ),
    httpOnly: true,
  };

  // In tests, we need to mock this properly
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendToken;