# API Reference Documentation

This document provides detailed information about all available API endpoints in the E-Commerce Backend.

## Base URL

All endpoints are relative to the base URL:

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require authentication via JWT token, which is stored in an HTTP-only cookie after login.

### Authentication Headers

Protected endpoints use cookie-based authentication with JWT tokens.

## Endpoints Summary

| Method | Endpoint               | Description                  | Auth Required | Admin Only |
| ------ | ---------------------- | ---------------------------- | ------------- | ---------- |
| POST   | /register              | Register new user            | No            | No         |
| POST   | /login                 | Login user                   | No            | No         |
| GET    | /logout                | Logout user                  | Yes           | No         |
| POST   | /password/forgot       | Request password reset       | No            | No         |
| PUT    | /password/reset/:token | Reset password with token    | No            | No         |
| GET    | /me                    | Get user profile             | Yes           | No         |
| PUT    | /password/update       | Update user password         | Yes           | No         |
| PUT    | /me/update             | Update user profile          | Yes           | No         |
| GET    | /admin/users           | Get all users                | Yes           | Yes        |
| GET    | /admin/user/:id        | Get user details             | Yes           | Yes        |
| PUT    | /admin/user/:id        | Update user role             | Yes           | Yes        |
| DELETE | /admin/user/:id        | Delete user                  | Yes           | Yes        |
| GET    | /products              | Get all products             | No            | No         |
| GET    | /admin/products        | Get all products (admin)     | Yes           | Yes        |
| POST   | /admin/product/new     | Create new product           | Yes           | Yes        |
| PUT    | /admin/product/:id     | Update product               | Yes           | Yes        |
| DELETE | /admin/product/:id     | Delete product               | Yes           | Yes        |
| GET    | /product/:id           | Get product details          | No            | No         |
| PUT    | /review                | Create/Update product review | Yes           | No         |
| GET    | /reviews               | Get product reviews          | No            | No         |
| DELETE | /reviews               | Delete review                | Yes           | No         |
| POST   | /order/new             | Create new order             | Yes           | No         |
| GET    | /order/:id             | Get order details            | Yes           | No         |
| GET    | /orders/me             | Get logged in user orders    | Yes           | No         |
| GET    | /admin/orders          | Get all orders               | Yes           | Yes        |
| PUT    | /admin/order/:id       | Update order status          | Yes           | Yes        |
| DELETE | /admin/order/:id       | Delete order                 | Yes           | Yes        |

## Detailed Endpoint Specifications

### User Authentication & Management

#### Register User

```
POST /register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Files:**

- `avatar` (optional): User profile image

**Response (201 Created):**

```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": {
      "public_id": "cloudinary_public_id",
      "url": "cloudinary_image_url"
    },
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Login User

```
POST /login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": {
      "public_id": "cloudinary_public_id",
      "url": "cloudinary_image_url"
    },
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Logout User

```
GET /logout
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged Out"
}
```

#### Forgot Password

```
POST /password/forgot
```

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email sent to john@example.com successfully"
}
```

#### Reset Password

```
PUT /password/reset/:token
```

**Request Parameters:**

- `token`: Password reset token received via email

**Request Body:**

```json
{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "user": {
    // User details
  }
}
```

#### Get User Details

```
GET /me
```

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": {
      "public_id": "cloudinary_public_id",
      "url": "cloudinary_image_url"
    },
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update Password

```
PUT /password/update
```

**Request Body:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "user": {
    // User details
  }
}
```

#### Update Profile

```
PUT /me/update
```

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "johnupdated@example.com"
}
```

**Files:**

- `avatar` (optional): Updated user profile image

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    // Updated user details
  }
}
```

### Admin User Management

#### Get All Users (Admin)

```
GET /admin/users
```

**Response (200 OK):**

```json
{
  "success": true,
  "users": [
    // Array of user objects
  ]
}
```

#### Get User Details (Admin)

```
GET /admin/user/:id
```

**Request Parameters:**

- `id`: User ID

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    // User details
  }
}
```

#### Update User Role (Admin)

```
PUT /admin/user/:id
```

**Request Parameters:**

- `id`: User ID

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Delete User (Admin)

```
DELETE /admin/user/:id
```

**Request Parameters:**

- `id`: User ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Products

#### Get All Products

```
GET /products
```

**Query Parameters:**

- `keyword`: Search term
- `category`: Filter by category
- `price[gte]`: Minimum price
- `price[lte]`: Maximum price
- `ratings[gte]`: Minimum rating
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 5)

**Response (200 OK):**

```json
{
  "success": true,
  "products": [
    // Array of product objects
  ],
  "productsCount": 50,
  "resultPerPage": 5,
  "filteredProductsCount": 10
}
```

#### Get Product Details

```
GET /product/:id
```

**Request Parameters:**

- `id`: Product ID

**Response (200 OK):**

```json
{
  "success": true,
  "product": {
    // Product details including reviews
  }
}
```

#### Create Product (Admin)

```
POST /admin/product/new
```

**Request Body:**

```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 1999,
  "category": "Electronics",
  "Stock": 50
}
```

**Files:**

- `images`: Product images (up to 5)

**Response (201 Created):**

```json
{
  "success": true,
  "product": {
    // Created product object
  }
}
```

#### Update Product (Admin)

```
PUT /admin/product/:id
```

**Request Parameters:**

- `id`: Product ID

**Request Body:**

- Any product fields to update

**Files:**

- `images` (optional): Updated product images

**Response (200 OK):**

```json
{
  "success": true,
  "product": {
    // Updated product details
  }
}
```

#### Delete Product (Admin)

```
DELETE /admin/product/:id
```

**Request Parameters:**

- `id`: Product ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### Create/Update Review

```
PUT /review
```

**Request Body:**

```json
{
  "productId": "product_id",
  "rating": 4,
  "comment": "Great product!"
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Get Product Reviews

```
GET /reviews?id=product_id
```

**Query Parameters:**

- `id`: Product ID

**Response (200 OK):**

```json
{
  "success": true,
  "reviews": [
    // Array of review objects
  ]
}
```

#### Delete Review

```
DELETE /reviews?productId=product_id&id=review_id
```

**Query Parameters:**

- `productId`: Product ID
- `id`: Review ID

**Response (200 OK):**

```json
{
  "success": true
}
```

### Orders

#### Create New Order

```
POST /order/new
```

**Request Body:**

```json
{
  "shippingInfo": {
    "address": "123 Main St",
    "city": "Anytown",
    "state": "State",
    "country": "Country",
    "pinCode": "12345",
    "phoneNo": "1234567890"
  },
  "orderItems": [
    {
      "name": "Product Name",
      "price": 1999,
      "quantity": 1,
      "image": "product_image_url",
      "product": "product_id"
    }
  ],
  "paymentInfo": {
    "id": "payment_id",
    "status": "succeeded"
  },
  "itemsPrice": 1999,
  "taxPrice": 200,
  "shippingPrice": 100,
  "totalPrice": 2299
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "order": {
    // Order details
  }
}
```

#### Get Single Order

```
GET /order/:id
```

**Request Parameters:**

- `id`: Order ID

**Response (200 OK):**

```json
{
  "success": true,
  "order": {
    // Order details
  }
}
```

#### My Orders

```
GET /orders/me
```

**Response (200 OK):**

```json
{
  "success": true,
  "orders": [
    // Array of user's orders
  ]
}
```

#### Get All Orders (Admin)

```
GET /admin/orders
```

**Response (200 OK):**

```json
{
  "success": true,
  "totalAmount": 100000,
  "orders": [
    // Array of all orders
  ]
}
```

#### Update Order Status (Admin)

```
PUT /admin/order/:id
```

**Request Parameters:**

- `id`: Order ID

**Request Body:**

```json
{
  "status": "Shipped"
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Delete Order (Admin)

```
DELETE /admin/order/:id
```

**Request Parameters:**

- `id`: Order ID

**Response (200 OK):**

```json
{
  "success": true
}
```

## Error Responses

All API endpoints return consistent error responses with the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "stack": "Stack trace (only in development mode)"
}
```

Common HTTP status codes:

- `400`: Bad Request - Invalid input or validation error
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Something went wrong on the server
