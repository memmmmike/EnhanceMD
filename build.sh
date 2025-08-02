#!/bin/bash

# EnhanceMD Build Script
echo "Building EnhanceMD for production..."

# Navigate to client directory
cd client

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Build for production
echo "Creating production build..."
pnpm build

echo "Build complete! Files are in client/dist/"
echo "To preview the build, run: cd client && pnpm preview"