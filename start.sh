#!/bin/bash

# EnhanceMD Startup Script
echo "Starting EnhanceMD..."

# Navigate to client directory
cd client

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Start development server
echo "Starting development server on port 4444..."
pnpm dev --port 4444