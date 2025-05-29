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
- CI/CD pipeline for AWS deployment with GitHub Actions and OIDC authentication

## Detailed Local Development Setup Guide

### Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- MongoDB Atlas account (for cloud database)
- Cloudinary account (for image upload functionality)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/vinoddotcom/ecom-learn-backend.git
cd ecom-learn-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the project root directory with the following variables:

```
# MongoDB Configuration
MONGODB_USER_NAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_CLUSTER=cluster0
MONGODB_DATABASE=ecommerceDB

# Server Configuration
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://{api_key}:{api_secret}@{cloud_name}
```

Replace the placeholder values with your actual credentials:

- **MongoDB Configuration**:

  - Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
  - Set up a new cluster (the free tier works for development)
  - Create a database user with read/write privileges
  - Use those credentials for MONGODB_USER_NAME and MONGODB_PASSWORD
  - Set MONGODB_CLUSTER to your cluster name (usually "cluster0")
  - MONGODB_DATABASE can be any name you prefer for your database

- **JWT Configuration**:

  - JWT_SECRET should be a secure random string
  - JWT_EXPIRE determines how long the authentication tokens will remain valid

- **Cloudinary Configuration**:
  - Create a Cloudinary account at https://cloudinary.com
  - Find your credentials in the Cloudinary dashboard
  - Set up CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET from your dashboard
  - The CLOUDINARY_URL follows the format: `cloudinary://{api_key}:{api_secret}@{cloud_name}`

### Step 4: Start Development Server

```bash
npm run dev
```

This will start the development server with hot-reloading enabled. The server will run on http://localhost:5000 by default (or the port you specified in your .env file).

### Step 5: Access the API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:5000/api-docs
```

This interactive documentation allows you to explore and test all API endpoints.

### Step 6: Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Step 7: Building for Production

```bash
# Lint the code
npm run lint

# Build the project
npm run build

# Start the production server
npm start
```

### Troubleshooting

1. **MongoDB Connection Issues**:

   - Verify that your MongoDB Atlas credentials are correct
   - Check if your IP address is whitelisted in MongoDB Atlas
   - Ensure your MongoDB user has the proper database access privileges

2. **Cloudinary Connection Issues**:

   - Verify your Cloudinary credentials
   - Check if you've set up the correct permissions in your Cloudinary account

3. **Port Already in Use**:

   - If port 5000 is already in use, change the PORT value in your .env file

4. **Node Version Issues**:
   - This project works best with Node.js v14.x or higher
   - Use nvm (Node Version Manager) to install and switch to a compatible Node.js version:
     ```
     nvm install 14
     nvm use 14
     ```

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

## Deployment

For details on deploying this application using our CI/CD pipeline to AWS ECS Fargate with ECR, see:

- [CI/CD Documentation](docs/CICD.md)
- [AWS Setup Guide](docs/AWS_SETUP.md)
- [OIDC Authentication Setup](docs/OIDC_SETUP.md)

## License

ISC
