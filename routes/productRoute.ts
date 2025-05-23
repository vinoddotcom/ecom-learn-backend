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
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - Stock
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Detailed product description
 *         price:
 *           type: number
 *           description: Product price
 *         ratings:
 *           type: number
 *           description: Average product rating
 *           default: 0
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               public_id:
 *                 type: string
 *               url:
 *                 type: string
 *         category:
 *           type: string
 *           description: Product category
 *         Stock:
 *           type: number
 *           description: Available stock quantity
 *         numOfReviews:
 *           type: number
 *           description: Number of reviews
 *           default: 0
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               name:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *         user:
 *           type: string
 *           description: ID of user who created the product
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         name: "iPhone 13 Pro"
 *         description: "6.1-inch Super Retina XDR display with ProMotion"
 *         price: 999.99
 *         category: "Electronics"
 *         Stock: 50
 *         images:
 *           - public_id: "products/iphone13"
 *             url: "https://res.cloudinary.com/example/image/upload/v1234/products/iphone13.jpg"
 */

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Fetch all products with filtering, pagination, and search capabilities
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search products by name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: ratings[gte]
 *         schema:
 *           type: number
 *         description: Minimum ratings filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 productsCount:
 *                   type: number
 *                 resultPerPage:
 *                   type: number
 *                 filteredProductsCount:
 *                   type: number
 */
router.route("/products").get(getAllProducts);

/**
 * @openapi
 * /admin/products:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all products (Admin)
 *     description: Get all products for admin dashboard without pagination
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products for admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 */
router.route("/admin/products").get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

/**
 * @openapi
 * /admin/product/new:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new product
 *     description: Add a new product to the database (Admin only)
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
 *               - name
 *               - description
 *               - price
 *               - category
 *               - Stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               Stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     public_id:
 *                       type: string
 *                     url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 */
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

/**
 * @openapi
 * /admin/product/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update a product
 *     description: Update an existing product by ID (Admin only)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               Stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     public_id:
 *                       type: string
 *                     url:
 *                       type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Product not found
 *
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a product
 *     description: Remove a product from the database (Admin only)
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Please login to access this resource
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Product not found
 */
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

/**
 * @openapi
 * /product/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product details
 *     description: Get detailed information about a specific product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.route("/product/:id").get(getProductDetails);

/**
 * @openapi
 * /review:
 *   put:
 *     tags:
 *       - Reviews
 *     summary: Create or update a review
 *     description: Add a new review or update an existing review for a product
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
 *               - productId
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to review
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Review comment
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Please login to access this resource
 *       404:
 *         description: Product not found
 */
router.route("/review").put(isAuthenticatedUser, createProductReview);

/**
 * @openapi
 * /reviews:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get all reviews for a product
 *     description: Retrieve all reviews for a specific product
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to get reviews for
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       name:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       comment:
 *                         type: string
 *                       _id:
 *                         type: string
 *       404:
 *         description: Product not found
 *
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review
 *     description: Remove a specific review from a product
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product containing the review
 *       - in: query
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Please login to access this resource
 *       404:
 *         description: Review not found or Product not found
 */
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser, deleteReview);

export default router;
