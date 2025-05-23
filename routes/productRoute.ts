/**
 * Product Routes
 * Handles all API endpoints related to product operations
 * @module routes/productRoute
 */

import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts,
} from "../controllers/productController";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth";

// Initialize express router
const router = express.Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filtering, pagination and searching
 * @access  Public
 */
router.route("/products").get(getAllProducts);

/**
 * @route   GET /api/v1/admin/products
 * @desc    Get all products for admin dashboard
 * @access  Private - Requires authentication and admin role
 */
router.route("/admin/products").get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

/**
 * @route   POST /api/v1/admin/product/new
 * @desc    Create a new product
 * @access  Private - Requires authentication and admin role
 */
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

/**
 * @route   PUT, DELETE /api/v1/admin/product/:id
 * @desc    Update or delete a product by ID
 * @access  Private - Requires authentication and admin role
 */
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

/**
 * @route   GET /api/v1/product/:id
 * @desc    Get detailed information about a specific product
 * @access  Public
 */
router.route("/product/:id").get(getProductDetails);

/**
 * @route   PUT /api/v1/review
 * @desc    Create or update product review
 * @access  Private - Requires authentication
 */
router.route("/review").put(isAuthenticatedUser, createProductReview);

/**
 * @route   GET, DELETE /api/v1/reviews
 * @desc    Get all reviews for a product or delete a review
 * @access  Mixed - GET is public, DELETE requires authentication
 */
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser, deleteReview);

export default router;
