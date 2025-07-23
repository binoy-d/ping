# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build React app
RUN cd client && npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/client/build ./client/build
COPY server.js ./

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of data directory
RUN chown -R nextjs:nodejs /app/data

USER nextjs

# Expose port
EXPOSE 5000

# Set environment variable for production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
