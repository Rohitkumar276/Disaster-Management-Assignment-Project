#!/bin/bash
set -e

echo "Starting Next.js application..."
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"

# Use the PORT environment variable or default to 3000
export PORT=${PORT:-3000}

# Start the Next.js application
exec npm start 