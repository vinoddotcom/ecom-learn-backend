# E-Commerce Backend Architecture Documentation

## System Overview

The E-Commerce Backend is a RESTful API service built with Node.js, Express, TypeScript, and MongoDB. It follows a layered architecture designed to provide a scalable, maintainable, and feature-rich backend for e-commerce applications.

## Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │      │                 │     │                 │     │                 │
│  API Endpoints  │─────▶│  Controllers    │────▶│  Services       │────▶│  Models         │
│  (Routes)       │      │                 │     │                 │     │                 │
│                 │      │                 │     │                 │     │                 │
└─────────────────┘      └─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                      │                       │
        │                        │                      │                       │
        ▼                        ▼                      ▼                       ▼
┌─────────────────┐      ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │      │                 │     │                 │     │                 │
│  Middleware     │      │  Error Handling │     │  Utilities      │     │  Database       │
│                 │      │                 │     │                 │     │  (MongoDB)      │
│                 │      │                 │     │                 │     │                 │
└─────────────────┘      └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Key Components

### Entry Points

- **app.ts**: Configures Express application with middleware and routes
- **server.ts**: Entry point that starts the HTTP server and connects to MongoDB

### Configuration

- **database.ts**: MongoDB connection setup using Mongoose
- **tsconfig.json**: TypeScript compiler configuration
- **tsup.config.ts**: Build configuration for production

### Controllers

Controllers handle HTTP requests and delegate business logic:

- **userController.ts**: User authentication and profile management
- **productController.ts**: Product CRUD operations and reviews
- **orderController.ts**: Order processing and management

### Models

MongoDB schemas using Mongoose:

- **userModel.ts**: User profile and authentication data
- **productModel.ts**: Product catalog with reviews
- **orderModel.ts**: Customer orders with items and payment info

### Routes

Express routers that define API endpoints:

- **userRoute.ts**: Authentication and user management
- **productRoute.ts**: Product catalog operations
- **orderRoute.ts**: Order processing

### Middleware

- **auth.ts**: Authentication and authorization checks
- **catchAsyncErrors.ts**: Async error handler wrapper
- **error.ts**: Centralized error handling middleware

### Utilities

- **apifeatures.ts**: Search, filtering and pagination utility
- **cloudinary.ts**: Image upload/management with Cloudinary
- **errorhandler.ts**: Custom error handling class
- **jwtToken.ts**: JWT token generation and management
- **swagger.ts**: API documentation generation

## Design Patterns

1. **MVC Pattern**: 
   - Models: Database schemas (MongoDB/Mongoose)
   - Views: N/A (API returns JSON)
   - Controllers: Handle requests and responses

2. **Middleware Pattern**:
   - Request processing pipeline with specialized middleware functions
   - Authentication, error handling, etc.

3. **Repository Pattern**:
   - Models abstract database operations
   - Controllers use models as repositories

4. **Factory Pattern**:
   - Error handler class creates appropriate error responses

## Authentication & Authorization Flow

1. User registers or logs in → JWT token generated
2. Token stored in HTTP-only cookie
3. Token verified on protected routes
4. Role-based access control for admin functions

## Error Handling Strategy

1. Central error handler middleware (error.ts)
2. Custom ErrorHandler class for application errors
3. Async error wrapper to catch promise rejections
4. Specific error types with appropriate status codes
5. Development vs. production error responses

## Data Flow

1. Request received by route handler
2. Middleware processes request (auth, validation)
3. Controller processes business logic
4. Model interacts with database
5. Response formatted and returned

## External Services Integration

- **MongoDB Atlas**: Cloud database
- **Cloudinary**: Image storage and manipulation
- **JWT**: Authentication tokens

## Testing Strategy

- Unit tests for controllers, models, and utilities
- Integration tests for API endpoints
- Mock dependencies using Vitest
- In-memory MongoDB for isolated database testing

## Build & Deployment

- TypeScript compilation using tsup
- Production build process in Dockerfile
- Environment configuration via .env files