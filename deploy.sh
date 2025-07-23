#!/bin/bash

# Build and start the ping-pong application
echo "Building ping-pong application..."

# Build the Docker image
docker-compose build

echo "Starting ping-pong application..."

# Start the application
docker-compose up -d

echo "Ping-pong application is now running on port 3002"
echo "Container status:"
docker-compose ps

echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""
echo "Configure your Cloudflare Tunnel to point ping.binoy.co to localhost:3002"
