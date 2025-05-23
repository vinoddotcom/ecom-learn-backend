/**
 * User Routes
 * Handles all API endpoints related to user authentication and profile management
 * @module routes/userRoute
 */

import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from "../controllers/userController";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth";

// Initialize express router
const router = express.Router();

/**
 * @route   POST /api/v1/register
 * @desc    Register a new user
 * @access  Public
 */
router.route("/register").post(registerUser);

/**
 * @route   POST /api/v1/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.route("/login").post(loginUser);

/**
 * @route   POST /api/v1/password/forgot
 * @desc    Send password reset email with reset token
 * @access  Public
 */
router.route("/password/forgot").post(forgotPassword);

/**
 * @route   PUT /api/v1/password/reset/:token
 * @desc    Reset password using token received via email
 * @access  Public
 */
router.route("/password/reset/:token").put(resetPassword);

/**
 * @route   GET /api/v1/logout
 * @desc    Logout user by clearing cookies
 * @access  Public
 */
router.route("/logout").get(logout);

/**
 * @route   GET /api/v1/me
 * @desc    Get currently logged in user details
 * @access  Private - Requires authentication
 */
router.route("/me").get(isAuthenticatedUser, getUserDetails);

/**
 * @route   PUT /api/v1/password/update
 * @desc    Update current user's password
 * @access  Private - Requires authentication
 */
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

/**
 * @route   PUT /api/v1/me/update
 * @desc    Update current user's profile information
 * @access  Private - Requires authentication
 */
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private - Requires authentication and admin role
 */
router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

/**
 * @route   GET, PUT, DELETE /api/v1/admin/user/:id
 * @desc    Get single user details, update user role, or delete user (Admin only)
 * @access  Private - Requires authentication and admin role
 */
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
