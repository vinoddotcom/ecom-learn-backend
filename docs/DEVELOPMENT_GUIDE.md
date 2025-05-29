# Development Guide

This document provides detailed guidelines and best practices for developing and maintaining the E-Commerce Backend project.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Code Style & Conventions](#code-style--conventions)
4. [TypeScript Best Practices](#typescript-best-practices)
5. [Testing Guide](#testing-guide)
6. [Debugging](#debugging)
7. [Git Workflow](#git-workflow)
8. [Documentation Standards](#documentation-standards)
9. [Code Review Process](#code-review-process)
10. [Continuous Integration](#continuous-integration)

## Development Environment Setup

### Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- Git
- MongoDB (local instance or MongoDB Atlas account)
- Cloudinary account
- Code editor (VS Code recommended)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/vinoddotcom/ecom-learn-backend.git
   cd ecom-learn-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```
   # MongoDB Configuration
   MONGODB_USER_NAME=your_mongodb_username
   MONGODB_PASSWORD=your_mongodb_password
   MONGODB_DATABASE=ecommerceDB

   # Server Configuration
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=5d
   COOKIE_EXPIRE=5

   # Cloudinary Configuration
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Access API documentation**
   Once the server is running, access Swagger documentation at:

   ```
   http://localhost:5000/api-docs
   ```

6. **Access Swagger Editor**
   For modifying API documentation:
   ```
   http://localhost:5000/swagger-editor
   ```

## Project Structure

```
ecom-learn-backend/
├── app.ts                  # Express app configuration
├── server.ts               # Server entry point
├── config/
│   └── database.ts         # Database connection
├── controllers/            # Request handlers
│   ├── orderController.ts
│   ├── productController.ts
│   └── userController.ts
├── middleware/             # Express middleware
│   ├── auth.ts             # Authentication middleware
│   ├── catchAsyncErrors.ts # Async error handler
│   └── error.ts            # Error handling middleware
├── models/                 # Mongoose schemas
│   ├── orderModel.ts
│   ├── productModel.ts
│   └── userModel.ts
├── routes/                 # API routes
│   ├── orderRoute.ts
│   ├── productRoute.ts
│   └── userRoute.ts
├── utils/                  # Utility functions
│   ├── apifeatures.ts      # Filtering, sorting, pagination
│   ├── cloudinary.ts       # Cloudinary integration
│   ├── errorhandler.ts     # Custom error class
│   ├── jwtToken.ts         # JWT token generation
│   └── swagger.ts          # API docs generation
├── types/                  # TypeScript type definitions
│   ├── cloudinary.d.ts
│   └── swagger.d.ts
├── test/                   # Testing files
├── docs/                   # Documentation
└── dist/                   # Compiled output (generated)
```

## Code Style & Conventions

### General Principles

- Follow DRY (Don't Repeat Yourself) principles
- Write modular, reusable code
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Naming Conventions

- **Files**: Use camelCase for filenames (e.g., `errorHandler.ts`)
- **Classes**: Use PascalCase (e.g., `ErrorHandler`)
- **Functions and Variables**: Use camelCase (e.g., `sendToken`)
- **Constants**: Use UPPER_SNAKE_CASE for true constants (e.g., `MAX_FILE_SIZE`)
- **Interfaces/Types**: Use PascalCase with 'I' prefix for interfaces (e.g., `IUser`)

### Code Formatting

This project uses ESLint and Prettier for code formatting. Run:

```bash
npm run lint     # Check code style
npm run prettify # Fix code formatting
```

ESLint rules are configured in `eslint.config.mjs`.

## TypeScript Best Practices

### Type Definitions

- Define clear interfaces for data models
- Avoid using `any` type when possible
- Use type inference when it's clear what the type should be
- Define function parameter and return types

Example:

```typescript
// Good
function calculateTotal(prices: number[]): number {
  return prices.reduce((sum, price) => sum + price, 0);
}

// Avoid
function calculateTotal(prices): any {
  return prices.reduce((sum, price) => sum + price, 0);
}
```

### Null Handling

- Use the non-null assertion operator (`!`) only when you're certain a value isn't null
- Prefer optional chaining (`?.`) and nullish coalescing (`??`) for safer access

Example:

```typescript
// Good
const userName = user?.name ?? "Anonymous";

// Avoid
const userName = user!.name;
```

### Type Guards

Use type guards to narrow types in conditional blocks:

```typescript
function processValue(value: string | number) {
  if (typeof value === "string") {
    // TypeScript knows value is a string here
    return value.toUpperCase();
  } else {
    // TypeScript knows value is a number here
    return value.toFixed(2);
  }
}
```

## Testing Guide

### Testing Strategy

This project uses Vitest for testing with the following structure:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints
3. **Mock Tests**: Test with mocked dependencies

### Test Directory Structure

```
test/
├── setup.ts                 # Test setup configuration
├── __mocks__/              # Mock files
└── __tests__/
    ├── controllers/        # Controller tests
    ├── middleware/         # Middleware tests
    ├── models/             # Model tests
    └── utils/              # Utility function tests
```

### Writing Tests

1. **Test File Naming**: Name test files with `.test.ts` extension
2. **Test Structure**: Use describe/it pattern
3. **Assertions**: Use expect statements

Example:

```typescript
import { describe, it, expect } from "vitest";
import ErrorHandler from "../utils/errorhandler";

describe("ErrorHandler", () => {
  it("should create an error with message and status code", () => {
    const error = new ErrorHandler("Not found", 404);
    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
  });
});
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:ui         # Run tests with UI
```

### Testing Best Practices

- Keep tests independent and isolated
- Mock external services
- Use descriptive test names
- Test edge cases and error paths
- Aim for high test coverage (>80%)

## Debugging

### Development Debugging

1. **Console Logging**: Use `console.log()` for quick debugging
2. **Node Inspector**: Use `--inspect` flag with Node.js
3. **VS Code Debugging**: Use the launch configurations in `.vscode/launch.json`

### Error Handling

The application uses a centralized error handling approach:

1. Custom `ErrorHandler` class for application errors
2. `catchAsyncErrors` wrapper for Promise rejections
3. Global error middleware in `middleware/error.ts`

### Viewing Error Logs

In development mode, full error stacks are returned in API responses. In production, only error messages are shown to users.

## Git Workflow

### Branching Strategy

Follow the GitHub Flow branching strategy:

1. **main**: Production-ready code
2. **feature/XXX**: Feature branches
3. **bugfix/XXX**: Bug fix branches
4. **hotfix/XXX**: Critical production fixes

### Commit Messages

Follow conventional commits pattern:

```
feat: add user authentication
fix: resolve order calculation issue
docs: update API documentation
test: add tests for product controller
refactor: improve error handling
```

### Pull Request Process

1. Create branch from main
2. Make changes and commit
3. Push branch and create PR
4. Ensure tests pass
5. Get code review
6. Merge to main

## Documentation Standards

### Code Documentation

- Use JSDoc comments for functions and classes
- Document parameters, return values, and thrown exceptions
- Add example usage for complex functions

Example:

```typescript
/**
 * Generates a JWT token for user authentication
 * @param user - User object containing _id
 * @param statusCode - HTTP status code for response
 * @param res - Express response object
 * @returns The response with token cookie
 */
const sendToken = (user: IUser, statusCode: number, res: Response): Response => {
  // Function implementation
};
```

### API Documentation

- Use OpenAPI/Swagger comments in route files
- Document all endpoints, parameters, and responses
- Include example requests and responses

Example:

```typescript
/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Login a user
 *     description: Authenticate user and return token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
```

## Code Review Process

### Review Checklist

1. **Functionality**: Does the code work as expected?
2. **Code Quality**: Is the code clean, readable, and maintainable?
3. **TypeScript**: Are types used correctly?
4. **Tests**: Are there adequate tests?
5. **Documentation**: Is the code documented?
6. **Security**: Are there any security concerns?
7. **Performance**: Are there any performance issues?

### Code Review Best Practices

- Be constructive and respectful
- Focus on the code, not the person
- Suggest solutions, not just problems
- Provide context for feedback
- Use inline comments for specific issues

## Continuous Integration

The project uses GitHub Actions for CI/CD:

1. **Lint**: Check code style
2. **Test**: Run automated tests
3. **Build**: Build the application
4. **Deploy**: Deploy to production (manual trigger)

### CI/CD Pipeline

Our CI/CD pipeline uses GitHub Actions with AWS ECS Fargate:

- Tests run on every push and pull request
- Build and deploy runs automatically on push to main branch
- Manual deployment is also available via workflow dispatch

For complete details on our CI/CD process, refer to:

- [CI/CD Documentation](./CICD.md)
- [AWS Setup Guide](./AWS_SETUP.md)

### Managing Environment Variables

Store sensitive values as GitHub repository variables and AWS Secrets Manager.

We use OpenID Connect (OIDC) for secure authentication between GitHub Actions and AWS, eliminating the need for long-lived access keys. Our specific IAM permissions policy grants:

- ECR access for specific repository (ecom-learn/backend)
- ECS access for specific cluster, service, and task definitions
- CloudWatch logs access

For details on how OIDC is set up and the specific permissions needed, refer to:

- [CI/CD Documentation](./CICD.md)
- [AWS IAM Policy JSON](./aws-iam-permissions-policy.json)

Never commit sensitive information to the repository.
