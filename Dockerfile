# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* ./

# Install project dependencies
RUN npm install --production=false --legacy-peer-deps

# Copy the rest of the application's source code from your host to your image filesystem.
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json for production dependencies
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm install --production=true --legacy-peer-deps

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.json ./swagger.json

# Expose the port the app runs on
# The docker-compose.yml exposes 4000 to the host, and maps it to port 80 internally.
# The server.ts listens on process.env.PORT or 8000, and docker-compose sets PORT=4000
# However, the healthcheck in docker-compose.yml points to http://localhost:8000/health
# Let's assume the application inside the container should listen on 8000 as per healthcheck and server.ts default.
# The docker-compose will map 4000 (host) to 8000 (container)
EXPOSE 8000

# Define the command to run your app
CMD ["node", "dist/server.js"]
