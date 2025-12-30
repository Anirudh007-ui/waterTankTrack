#!/bin/bash

# Quick Test Script - Tests API and runs a short load test

BASE_URL="http://localhost:3000"
API_KEY="WATER_TANK_API_KEY_2024_SECURE"

echo "=========================================="
echo "🧪 Quick API Test"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check..."
curl -s "$BASE_URL/health" | python3 -m json.tool 2>/dev/null | head -10 || echo "❌ Health check failed"
echo ""

# Test 2: POST with API Key
echo "2️⃣  POST /api/water-level (with API key)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/water-level" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "deviceId": "ESP32_TEST",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }')

if [ "$RESPONSE" = "OK" ]; then
    echo "✅ POST successful: $RESPONSE"
else
    echo "❌ POST failed: $RESPONSE"
fi
echo ""

# Test 3: GET Latest
echo "3️⃣  GET /api/latest..."
curl -s "$BASE_URL/api/latest" | python3 -m json.tool 2>/dev/null | head -15 || echo "❌ GET failed"
echo ""

echo "=========================================="
echo "✅ Quick Test Complete!"
echo "=========================================="
echo ""
echo "To run load test:"
echo "  node load-test.js --devices=5 --interval=60 --duration=5"
echo ""

