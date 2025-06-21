#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Listing contents:"
ls -la

echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

echo "Build completed successfully!" 