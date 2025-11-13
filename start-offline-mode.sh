#!/bin/bash

echo "========================================"
echo "  Starting Offline Mode (Dual Mode System)"
echo "========================================"
echo ""
echo "This will start:"
echo "1. Express API Server (Port 3001)"
echo "2. Frontend Dev Server (Port 5173)"
echo ""
echo "Make sure APP_MODE is set to 'offline' in src/config/appConfig.ts"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "⚠️  Bun is not installed. Trying with npm..."
    USE_NPM=true
else
    echo "✅ Using Bun"
    USE_NPM=false
fi

echo ""
echo "Starting Express API Server..."
if [ "$USE_NPM" = true ]; then
    npm run api &
else
    bun run api &
fi

# Wait for server to start
sleep 3

echo "Starting Frontend Dev Server..."
if [ "$USE_NPM" = true ]; then
    npm run dev &
else
    bun run dev &
fi

echo ""
echo "========================================"
echo "  Both servers are starting..."
echo "========================================"
echo ""
echo "Express API Server: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait

