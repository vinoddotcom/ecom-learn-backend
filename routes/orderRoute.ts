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
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - quantity
 *         - image
 *         - product
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the product
 *         price:
 *           type: number
 *           description: Price of the product
 *         quantity:
 *           type: number
 *           description: Quantity ordered
 *         image:
 *           type: string
 *           description: Image URL of the product
 *         product:
 *           type: string
 *           description: ID of the product
 *
 *     ShippingInfo:
 *       type: object
 *       required:
 *         - address
 *         - city
 *         - state
 *         - country
 *         - pinCode
 *         - phoneNo
 *       properties:
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City name
 *         state:
 *           type: string
 *           description: State or province
 *         country:
 *           type: string
 *           description: Country name
 *         pinCode:
 *           type: number
 *           description: Postal or PIN code
 *         phoneNo:
 *           type: number
 *           description: Contact phone number
 *
 *     PaymentInfo:
 *       type: object
 *       required:
 *         - id
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: Payment transaction ID
 *         status:
 *           type: string
 *           description: Payment status
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         shippingInfo:
 *           $ref: '#/components/schemas/ShippingInfo'
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         user:
 *           type: string
 *           description: ID of the user who placed the order
 *         paymentInfo:
 *           $ref: '#/components/schemas/PaymentInfo'
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when payment was made
 *         itemsPrice:
 *           type: number
 *           description: Price of all items combined
 *         taxPrice:
 *           type: number
 *           description: Tax amount
 *         shippingPrice:
 *           type: number
 *           description: Shipping cost
 *         totalPrice:
 *           type: number
 *           description: Total order amount including tax and shipping
 *         orderStatus:
 *           type: string
 *           enum: [Processing, Shipped, Delivered]
 *           default: Processing
 *           description: Current status of the order
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when order was delivered
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when order was created
 */

/**
 * @openapi
 * /order/new:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     description: Place a new order with product details, shipping information and payment details
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingInfo
 *               - orderItems
 *               - paymentInfo
 *               - itemsPrice
 *               - taxPrice
 *               - shippingPrice
 *               - totalPrice
 *             properties:
 *               shippingInfo:
 *                 $ref: '#/components/schemas/ShippingInfo'
 *               orderItems:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               paymentInfo:
 *                 $ref: '#/components/schemas/PaymentInfo'
 *               itemsPrice:
 *                 type: number
 *               taxPrice:
 *                 type: number
 *               shippingPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Please login to access this resource
 *       500:
 *         description: Server error
 */
router.route("/order/new").post(isAuthenticatedUser, newOrder);

/**
 * @openapi
 * /order/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order details
 *     description: Get detailed information about a specific order
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Please login to access this resource
 *       404:
 *         description: Order not found
 */
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

/**
 * @openapi
 * /orders/me:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get my orders
 *     description: Get all orders placed by the currently logged in user
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Please login to access this resource
 */
router.route("/orders/me").get(isAuthenticatedUser, myOrders);

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all orders
 *     description: Retrieve a list of all orders (Admin only)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalAmount:
 *                   type: number
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 */
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

/**
 * @openapi
 * /admin/order/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update order status
 *     description: Update the status of an order (Admin only)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Processing, Shipped, Delivered]
 *                 description: New order status
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status or order already delivered
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Order not found
 *
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete order
 *     description: Remove an order from the database (Admin only)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Order not found
 */
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

export default router;
