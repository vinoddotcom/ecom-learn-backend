import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import User from "../../../models/userModel";
import { setupDatabase, closeDatabase, clearDatabase } from "../../setup";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

describe("User Model", () => {
  // Connect to the database before all tests
  beforeAll(async () => {
    await setupDatabase();
  });

  // Clear the database after each test
  beforeEach(async () => {
    await clearDatabase();
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await closeDatabase();
  });

  // Test for user creation with valid data
  it("should create a new user with valid data", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      avatar: {
        public_id: "test_id",
        url: "https://test.com/image.jpg",
      },
    };

    const user = await User.create(userData);

    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.avatar.public_id).toBe(userData.avatar.public_id);
    expect(user.avatar.url).toBe(userData.avatar.url);
    expect(user.role).toBe("user"); // Default role
  });

  // Test for password hashing middleware
  it("should hash password before saving", async () => {
    const userData = {
      name: "Hash Test",
      email: "hash@example.com",
      password: "password123",
      avatar: {
        public_id: "hash_id",
        url: "https://test.com/hash.jpg",
      },
    };

    const user = await User.create(userData);

    // Password should be hashed and not equal to original
    expect(user.password).not.toBe("password123");

    // Password should be successfully hashed
    const isMatch = await bcrypt.compare("password123", user.password);
    expect(isMatch).toBe(true);
  });

  // Test that password is not hashed again if not modified
  it("should not hash password if not modified", async () => {
    // Create initial user
    const userData = {
      name: "Update Test",
      email: "update@example.com",
      password: "password123",
      avatar: {
        public_id: "update_id",
        url: "https://test.com/update.jpg",
      },
    };

    const user = await User.create(userData);
    const originalHashedPassword = user.password;

    // Update user without changing password
    user.name = "Updated Name";
    await user.save();

    // Password hash should remain the same
    expect(user.password).toBe(originalHashedPassword);
  });

  // Test JWT token generation
  it("should generate valid JWT token", async () => {
    // Mock JWT environment variables
    process.env.JWT_SECRET = "test_jwt_secret";
    process.env.JWT_EXPIRE = "1h";

    const userData = {
      name: "JWT Test",
      email: "jwt@example.com",
      password: "password123",
      avatar: {
        public_id: "jwt_id",
        url: "https://test.com/jwt.jpg",
      },
    };

    const user = await User.create(userData);
    const token = user.getJWTToken();

    // Verify token exists
    expect(token).toBeDefined();

    // Verify token can be decoded with our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty("id", (user._id as string).toString());
  });

  // Test comparePassword method
  it("should correctly compare passwords", async () => {
    const userData = {
      name: "Compare Test",
      email: "compare@example.com",
      password: "password123",
      avatar: {
        public_id: "compare_id",
        url: "https://test.com/compare.jpg",
      },
    };

    const user = await User.create(userData);

    // Correct password should return true
    const correctMatch = await user.comparePassword("password123");
    expect(correctMatch).toBe(true);

    // Incorrect password should return false
    const wrongMatch = await user.comparePassword("wrongpassword");
    expect(wrongMatch).toBe(false);
  });

  // Test reset password token generation
  it("should generate reset password token", async () => {
    const userData = {
      name: "Reset Test",
      email: "reset@example.com",
      password: "password123",
      avatar: {
        public_id: "reset_id",
        url: "https://test.com/reset.jpg",
      },
    };

    const user = await User.create(userData);

    // Generate reset token
    const resetToken = user.getResetPasswordToken();

    // Token should be defined
    expect(resetToken).toBeDefined();
    expect(typeof resetToken).toBe("string");

    // User should now have resetPasswordToken and resetPasswordExpire
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpire).toBeDefined();

    // Expiration should be approximately 15 min from now
    const expirationTime = user.resetPasswordExpire?.getTime();
    const now = Date.now();
    const fifteenMinutesInMs = 15 * 60 * 1000;

    expect(expirationTime).toBeGreaterThan(now);
    expect(expirationTime).toBeLessThan(now + fifteenMinutesInMs + 100); // Add small buffer for test execution time
  });

  // Test input validation
  it("should enforce validation rules", async () => {
    // Test for minimum name length
    const shortNameUser = {
      name: "Abc", // Less than 4 characters
      email: "short@example.com",
      password: "password123",
      avatar: {
        public_id: "short_id",
        url: "https://test.com/short.jpg",
      },
    };

    await expect(User.create(shortNameUser)).rejects.toThrow();

    // Test for maximum name length
    const longNameUser = {
      name: "A".repeat(31), // More than 30 characters
      email: "long@example.com",
      password: "password123",
      avatar: {
        public_id: "long_id",
        url: "https://test.com/long.jpg",
      },
    };

    await expect(User.create(longNameUser)).rejects.toThrow();

    // Test for invalid email
    const invalidEmailUser = {
      name: "Invalid Email",
      email: "notanemail",
      password: "password123",
      avatar: {
        public_id: "invalid_id",
        url: "https://test.com/invalid.jpg",
      },
    };

    await expect(User.create(invalidEmailUser)).rejects.toThrow();

    // Test for short password
    const shortPasswordUser = {
      name: "Short Password",
      email: "shortpw@example.com",
      password: "1234567", // Less than 8 characters
      avatar: {
        public_id: "shortpw_id",
        url: "https://test.com/shortpw.jpg",
      },
    };

    await expect(User.create(shortPasswordUser)).rejects.toThrow();
  });
});
