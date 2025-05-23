# E-Commerce API Backend

A fully featured RESTful API backend for an e-commerce platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization (JWT)
- Product management with search, filter, and pagination
- Shopping cart functionality
- Order processing
- Payment integration
- Review and rating system
- Admin dashboard for managing products, users, and orders
- Cloudinary integration for image uploads
- Comprehensive test coverage with Vitest
- API documentation with Swagger/OpenAPI

## API Documentation

This project includes Swagger/OpenAPI documentation for easy API exploration and testing.

### Accessing the API Documentation

When the server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

The documentation provides:

- Complete endpoint listing
- Request/response schemas
- Authentication requirements
- Interactive API testing capability

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/ecom-learn-backend.git
   cd ecom-learn-backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the project root with the following variables:

   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=5d
   COOKIE_EXPIRE=5
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Build the project

   ```bash
   npm run build
   ```

5. Start the server
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the TypeScript code
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint to check code quality

## API Routes

The API is structured around the following resources:

### Authentication

- `POST /api/v1/register` - Register a new user
- `POST /api/v1/login` - Login and get token
- `GET /api/v1/logout` - Logout user
- `POST /api/v1/password/forgot` - Request password reset
- `PUT /api/v1/password/reset/:token` - Reset password

### User Management

- `GET /api/v1/me` - Get user profile
- `PUT /api/v1/me/update` - Update profile
- `PUT /api/v1/password/update` - Update password
- `GET /api/v1/admin/users` - Get all users (admin)
- `GET /api/v1/admin/user/:id` - Get user details (admin)
- `PUT /api/v1/admin/user/:id` - Update user role (admin)
- `DELETE /api/v1/admin/user/:id` - Delete user (admin)

### Products

- `GET /api/v1/products` - Get all products
- `GET /api/v1/product/:id` - Get product details
- `POST /api/v1/admin/product/new` - Create product (admin)
- `PUT /api/v1/admin/product/:id` - Update product (admin)
- `DELETE /api/v1/admin/product/:id` - Delete product (admin)
- `PUT /api/v1/review` - Create/update review
- `GET /api/v1/reviews` - Get product reviews
- `DELETE /api/v1/reviews` - Delete review

### Orders

- `POST /api/v1/order/new` - Create order
- `GET /api/v1/order/:id` - Get order details
- `GET /api/v1/orders/me` - Get user orders
- `GET /api/v1/admin/orders` - Get all orders (admin)
- `PUT /api/v1/admin/order/:id` - Update order status (admin)
- `DELETE /api/v1/admin/order/:id` - Delete order (admin)

## License

ISC
