import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorhandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import User from "../models/userModel";
import sendToken from "../utils/jwtToken";
import crypto from "crypto";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

// Register a User
export const registerUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // Upload avatar image to Cloudinary
      const myCloud = await uploadToCloudinary(req.body.avatar, "avatars", {
        width: 150,
        crop: "scale",
      });

      const user = await User.create({
        name,
        email,
        password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// Login User
export const loginUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // checking if user has given password and email both
    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
  }
);

// Logout User
export const logout = catchAsyncErrors(async (req: Request, res: Response) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
export const forgotPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      // TODO: Implement proper email sending functionality
      // For now, using a placeholder
      // await sendEmail({
      //   email: user.email,
      //   subject: `Ecommerce Password Recovery`,
      //   message,
      // });

      // Mock send email for now (you'll need to implement this)
      console.log(`Would send email to ${user.email} with message: ${message}`);

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// Reset Password
export const resetPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  }
);

// Get User Detail
export const getUserDetails = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
export const updatePassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!.id).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  }
);

// update User Profile
export const updateProfile = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      interface UserUpdateData {
        name: string;
        email: string;
        avatar?: {
          public_id: string;
          url: string;
        };
      }

      const newUserData: UserUpdateData = {
        name: req.body.name,
        email: req.body.email,
      };

      if (req.body.avatar && req.body.avatar !== "") {
        const user = await User.findById(req.user!.id);

        if (!user) {
          return next(new ErrorHandler("User not found", 404));
        }

        // Delete old avatar from Cloudinary
        const imageId = user.avatar.public_id;
        await deleteFromCloudinary(imageId);

        // Upload new avatar to Cloudinary
        const myCloud = await uploadToCloudinary(req.body.avatar, "avatars", {
          width: 150,
          crop: "scale",
        });

        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await User.findByIdAndUpdate(req.user!.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// Get all users(admin)
export const getAllUsers = catchAsyncErrors(async (_req: Request, res: Response) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
export const getSingleUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);

// update User Role -- Admin
export const updateUserRole = catchAsyncErrors(async (req: Request, res: Response) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
export const deleteUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
      }

      // Delete user avatar from Cloudinary
      const imageId = user.avatar.public_id;
      await deleteFromCloudinary(imageId);

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
      });
    } catch (error) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);
