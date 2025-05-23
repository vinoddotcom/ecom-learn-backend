/**
 * Order Routes
 * Handles all API endpoints related to order operations
 * @module routes/orderRoute
 */

import express from "express";
import {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth";

// Initialize express router
const router = express.Router();

/**
 * @route   POST /api/v1/order/new
 * @desc    Create a new order
 * @access  Private - Requires authentication
 */
router.route("/order/new").post(isAuthenticatedUser, newOrder);

/**
 * @route   GET /api/v1/order/:id
 * @desc    Get details of a specific order by ID
 * @access  Private - Requires authentication
 */
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

/**
 * @route   GET /api/v1/orders/me
 * @desc    Get all orders of the logged-in user
 * @access  Private - Requires authentication
 */
router.route("/orders/me").get(isAuthenticatedUser, myOrders);

/**
 * @route   GET /api/v1/admin/orders
 * @desc    Get all orders (Admin only)
 * @access  Private - Requires authentication and admin role
 */
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

/**
 * @route   PUT, DELETE /api/v1/admin/order/:id
 * @desc    Update or delete order status (Admin only)
 * @access  Private - Requires authentication and admin role
 */
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

export default router;
