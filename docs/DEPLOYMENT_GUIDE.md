# Deployment Guide

This document provides instructions for deploying the E-Commerce Backend to different environments.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Database Migration](#database-migration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling Considerations](#scaling-considerations)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

## Deployment Options

The E-Commerce Backend can be deployed in various environments:

1. **Local Development**: For testing and development
2. **Docker Container**: For consistent deployment across environments
3. **Cloud Platforms**: AWS, Google Cloud, Azure, Heroku, etc.
4. **Self-hosted Servers**: Traditional VPS or dedicated servers

## Environment Configuration

### Environment Variables

Configure the following environment variables for each deployment:

```
# MongoDB Configuration
MONGODB_USER_NAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_DATABASE=ecommerceDB

# Server Configuration
PORT=5000
NODE_ENV=PRODUCTION
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Environment-Specific Configuration

- **Development**: Use `.env` file in project root
- **Production**: Use environment variables configured in the hosting platform
- **CI/CD**: Use secrets in CI/CD platform

## Docker Deployment

### Using the Provided Dockerfile

The project includes a Dockerfile for containerized deployment:

1. **Build the Docker Image**:

   ```bash
   docker build -t ecommerce-backend .
   ```

2. **Run the Container**:
   ```bash
   docker run -p 5000:5000 --env-file .env ecommerce-backend
   ```

### Docker Compose Setup

Create a `docker-compose.yml` file for running with related services:

```yaml
version: "3"

services:
  app:
    build: .
    ports:
      - "5000:5000"
    env_file: .env
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGODB_USER_NAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGODB_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGODB_DATABASE}

volumes:
  mongodb_data:
```

Run with:

```bash
docker-compose up -d
```

## Cloud Platform Deployment

### AWS Deployment

Our recommended AWS deployment method uses ECS Fargate with CI/CD automation:

#### Using AWS ECS Fargate with CI/CD:

Please refer to the following documentation for detailed instructions:

1. [CI/CD Documentation](./CICD.md) - Setting up the CI/CD pipeline
2. [AWS Setup Guide](./AWS_SETUP.md) - Configuring all required AWS resources

This approach provides:

- Container-based deployment
- Automated testing, building, and deployment
- Infrastructure as Code principles
- Secure authentication with OIDC
- Scalability and reliability

### Heroku Deployment

1. **Install Heroku CLI**:

   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**:

   ```bash
   heroku login
   ```

3. **Create Heroku App**:

   ```bash
   heroku create ecommerce-backend-app
   ```

4. **Set Environment Variables**:

   ```bash
   heroku config:set MONGODB_USER_NAME=username
   heroku config:set MONGODB_PASSWORD=password
   # Set other environment variables
   ```

5. **Deploy to Heroku**:
   ```bash
   git push heroku main
   ```

## CI/CD Pipeline

We have implemented a robust CI/CD pipeline using GitHub Actions for deploying our application to AWS ECS Fargate with container images stored in ECR.

For detailed information about our CI/CD process, please refer to the following documents:

- [CI/CD Documentation](./CICD.md) - Explains the CI/CD workflow and setup
- [AWS Setup Guide](./AWS_SETUP.md) - Provides detailed steps for configuring AWS resources

The pipeline automatically:

1. Runs tests
2. Builds a Docker image
3. Pushes the image to Amazon ECR
4. Deploys to ECS Fargate

### Authentication

The pipeline uses OpenID Connect (OIDC) for secure authentication with AWS, eliminating the need for long-lived access keys.

### GitHub Actions Workflow

The workflow is defined in `.github/workflows/ci-cd.yml` and is triggered on:

- Pushes to the main branch
- Pull requests against the main branch
- Manual workflow dispatch

## Database Migration

### MongoDB Data Migration

1. **Export Data from Development**:

   ```bash
   mongoexport --uri="mongodb+srv://username:password@cluster.mongodb.net/ecommerceDB" --collection=products --out=products.json
   ```

2. **Import Data to Production**:
   ```bash
   mongoimport --uri="mongodb+srv://username:password@production-cluster.mongodb.net/ecommerceDB" --collection=products --file=products.json
   ```

### Schema Changes

When making schema changes:

1. Plan backward compatibility
2. Update models in stages
3. Test migration with sample data
4. Use database transactions when possible

## Monitoring & Logging

### Implementing Monitoring

1. **Add Application Metrics**:

   - Install monitoring packages:
     ```bash
     npm install prom-client winston
     ```

2. **Configure Logging**:

   ```typescript
   // Add to your app.ts
   import winston from "winston";

   const logger = winston.createLogger({
     level: "info",
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: "error.log", level: "error" }),
       new winston.transports.File({ filename: "combined.log" }),
     ],
   });

   if (process.env.NODE_ENV !== "production") {
     logger.add(
       new winston.transports.Console({
         format: winston.format.simple(),
       })
     );
   }
   ```

3. **Use Cloud Monitoring Services**:
   - AWS CloudWatch
   - Google Cloud Monitoring
   - New Relic
   - Datadog

## Scaling Considerations

### Horizontal Scaling

1. **Stateless Design**:

   - Ensure the application is stateless to scale horizontally
   - Use Redis or similar for session management if needed

2. **Load Balancing**:

   - Configure load balancers in cloud environments
   - Use Nginx as a reverse proxy in self-hosted setups

3. **Database Scaling**:
   - Use MongoDB Atlas for automatic scaling
   - Implement read replicas for read-heavy workloads
   - Consider sharding for large datasets

### Vertical Scaling

1. **Resource Optimization**:

   - Monitor memory usage and optimize
   - Use Node.js clustering to utilize multiple CPU cores

2. **Memory Management**:
   - Set appropriate Node.js memory limits
   - Implement efficient caching strategies

## Backup & Recovery

### Database Backup

1. **Scheduled Backups**:

   - MongoDB Atlas automated backups
   - Custom backup scripts using `mongodump`

2. **Backup Verification**:
   - Regularly test restores in development environment
   - Validate backup integrity

### Application Backup

1. **Code Repository**:

   - Maintain Git repository with tags for releases
   - Archive configurations separately

2. **Environment Recovery**:
   - Document recovery procedures
   - Create infrastructure as code (IaC) for reproducibility

## Troubleshooting

### Common Issues

1. **Connection Problems**:

   - Check network connectivity
   - Verify MongoDB connection string
   - Check firewall settings

2. **Performance Issues**:

   - Monitor CPU and memory usage
   - Check database query performance
   - Look for memory leaks

3. **Authentication Failures**:
   - Verify JWT secret is correctly set
   - Check MongoDB user permissions

### Debugging in Production

1. **Enable Detailed Logging Temporarily**:

   ```bash
   # For ECS deployments, update the task definition with additional environment variables
   aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment
   ```

2. **Check Application Logs**:

   ```bash
   # Check ECS logs
   aws logs get-log-events --log-group-name /ecs/ecom-backend --log-stream-name ecs/ecom-backend-container/<task-id>

   # Or use CloudWatch Logs Insights
   aws logs start-query --log-group-name /ecs/ecom-backend --start-time <start-time> --end-time <end-time> --query-string "fields @timestamp, @message | filter @message like /ERROR/"
   ```

3. **Use Diagnostic Tools**:
   - Node.js memory snapshots
   - MongoDB performance analyzer
