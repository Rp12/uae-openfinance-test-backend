#!/bin/bash

echo "🚀 UAE Open Finance Insurance API - Quick Start"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Generate keys if they don't exist
if [ ! -f "keys/private-key.pem" ]; then
    echo "🔑 Generating RSA keys..."
    npm run generate-keys
    echo ""
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "Starting server..."
echo "API Documentation: http://localhost:3000/api-docs"
echo "Health Check: http://localhost:3000/health"
echo ""

# Start the server
npm start
