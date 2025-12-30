#!/bin/bash

# Quick CURL Test Script
# Tests all endpoints with curl commands

BASE_URL="http://localhost:3000"
API_KEY="WATER_TANK_API_KEY_2024_SECURE"

echo "🧪 Testing Water Tank API with CURL"
echo "===================================="
echo ""

# 1. Health Check
echo "1️⃣  Health Check:"
curl -s "$BASE_URL/health" | python3 -m json.tool 2>/dev/null | head -10 || curl -s "$BASE_URL/health"
echo ""
echo ""

# 2. Root Endpoint
echo "2️⃣  Root Endpoint:"
curl -s "$BASE_URL/" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/"
echo ""
echo ""

# 3. POST Valid Data
echo "3️⃣  POST /api/water-level (with API key):"
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
echo "Response: $RESPONSE"
if [ "$RESPONSE" = "OK" ]; then
    echo "✅ POST successful!"
else
    echo "❌ POST failed!"
fi
echo ""
echo ""

# 4. GET Latest Data
echo "4️⃣  GET /api/latest:"
curl -s "$BASE_URL/api/latest" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/latest"
echo ""
echo ""

# 5. Test Error - Missing API Key
echo "5️⃣  Testing Error - Missing API Key:"
ERROR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/water-level" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"ESP32_001","distanceCm":"15.5"}')
echo "$ERROR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ERROR_RESPONSE"
echo ""
echo ""

echo "===================================="
echo "✅ CURL Test Complete!"
echo "===================================="

