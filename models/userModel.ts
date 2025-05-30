import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Define a TypeScript interface for User
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  createdAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;

  // Methods
  getJWTToken(): string;
  comparePassword(password: string): Promise<boolean>;
  getResetPasswordToken(): string;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: false,
      default: "default_avatar/default",
    },
    url: {
      type: String,
      required: false,
      default: "https://res.cloudinary.com/demo/image/upload/v1580125506/default_avatar.png",
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function (): string {
  // Set default values for JWT configuration if environment variables aren't set
  const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key_do_not_use_in_production";
  const jwtExpire = process.env.JWT_EXPIRE || "7d";

  // @ts-expect-error - Ignoring type issues with jwt.sign
  // The jwt.sign function accepts these parameters correctly at runtime
  return jwt.sign({ id: this._id }, jwtSecret, { expiresIn: jwtExpire });
};

// Compare Password

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
