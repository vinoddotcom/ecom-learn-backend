# Use Node.js LTS version as the base image
FROM node:22-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies with improved caching and security flags
RUN npm ci --legacy-peer-deps --no-audit

# Copy the rest of the application code
COPY . .

# Build the TypeScript project
RUN npm run build

# Generate Swagger documentation after build
RUN node -e "try { require('./dist/utils/swagger.js').saveSwaggerJson(); console.log('Swagger JSON generated'); } catch(e) { console.log('Failed to generate Swagger JSON:', e.message); }"

# Production stage
FROM node:22-alpine as production

# Set working directory
WORKDIR /app

# Add a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies with security flags
RUN npm ci --only=production --legacy-peer-deps --no-audit

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.json ./swagger.json

# Create a directory for logs if your app uses it and set proper permissions for files
RUN mkdir -p /app/logs && \
    touch /app/swagger.json && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app

# Set the user to run the application
USER appuser

# Add healthcheck to verify container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "dist/server.js"]