#!/bin/bash

# Local Testing Script for Water Tank Level API
# This script tests all endpoints locally

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "🧪 Testing Water Tank Level API Locally"
echo "=========================================="
echo ""

# Check if server is running
echo "1️⃣  Checking if server is running..."
if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo "✅ Server is running!"
else
    echo "❌ Server is not running. Please start it first:"
    echo "   npm start"
    echo ""
    exit 1
fi

echo ""
echo "2️⃣  Testing Health Endpoint..."
curl -s "$BASE_URL/health" | python3 -m json.tool || curl -s "$BASE_URL/health"
echo ""
echo ""

echo "3️⃣  Testing POST /api/water-level..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/water-level" \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }')

echo "Response: $RESPONSE"
if [ "$RESPONSE" = "OK" ]; then
    echo "✅ POST request successful!"
else
    echo "❌ POST request failed!"
fi
echo ""
echo ""

echo "4️⃣  Testing GET /api/latest..."
curl -s "$BASE_URL/api/latest" | python3 -m json.tool || curl -s "$BASE_URL/api/latest"
echo ""
echo ""

echo "5️⃣  Testing Root Endpoint..."
curl -s "$BASE_URL/" | python3 -m json.tool || curl -s "$BASE_URL/"
echo ""
echo ""

echo "=========================================="
echo "✅ Testing Complete!"
echo "=========================================="

