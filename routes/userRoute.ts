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
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         avatar:
 *           type: object
 *           properties:
 *             public_id:
 *               type: string
 *               description: Cloudinary public ID for the avatar image
 *             url:
 *               type: string
 *               description: URL to access the avatar image
 *           description: User's avatar image information (optional, default provided)
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         name: John Doe
 *         email: john@example.com
 *         password: password123
 *         role: user
 *         avatar:
 *           public_id: "avatars/123"
 *           url: "https://res.cloudinary.com/example/image/upload/v1234/avatars/123.jpg"
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *       example:
 *         email: john@example.com
 *         password: password123
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         avatar:
 *           type: string
 *           format: binary
 *           description: Optional user avatar image (base64 encoded)
 *       example:
 *         name: John Doe
 *         email: john@example.com
 *         password: password123
 */

/**
 * @openapi
 * /register:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Register a new user
 *     description: Create a new user account with name, email, password and optional profile picture
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation Error
 *       500:
 *         description: Server Error
 */
router.route("/register").post(registerUser);

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Login a user
 *     description: Authenticate a user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid email or password
 *       400:
 *         description: Please provide email and password
 */
router.route("/login").post(loginUser);

/**
 * @openapi
 * /password/forgot:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Request password reset
 *     description: Send password reset email with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server Error
 */
router.route("/password/forgot").post(forgotPassword);

/**
 * @openapi
 * /password/reset/{token}:
 *   put:
 *     tags:
 *       - User Authentication
 *     summary: Reset password
 *     description: Reset password using token received in email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token sent to email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Token is invalid or has expired
 *       500:
 *         description: Server Error
 */
router.route("/password/reset/:token").put(resetPassword);

/**
 * @openapi
 * /logout:
 *   get:
 *     tags:
 *       - User Authentication
 *     summary: Log out a user
 *     description: Log out the user by clearing authentication cookies
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.route("/logout").get(logout);

/**
 * @openapi
 * /me:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get current user details
 *     description: Retrieves the profile of the currently logged in user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Please login to access this resource
 */
router.route("/me").get(isAuthenticatedUser, getUserDetails);

/**
 * @openapi
 * /password/update:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update user password
 *     description: Update the password for the currently logged in user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Old password is incorrect or passwords do not match
 *       401:
 *         description: Please login to access this resource
 */
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

/**
 * @openapi
 * /me/update:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update user profile
 *     description: Update the name and email for the currently logged in user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Optional - new profile picture
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Please login to access this resource
 */
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     description: Retrieve a list of all user accounts (Admin only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 */
router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

/**
 * @openapi
 * /admin/user/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get user details
 *     description: Retrieve details for a specific user (Admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 *
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user role
 *     description: Change a user's role (Admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 *
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete user
 *     description: Delete a user account (Admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
