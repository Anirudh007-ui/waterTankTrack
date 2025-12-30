# Complete CURL Commands Reference

All curl commands to test the Water Tank Level API locally.

**Base URL:** `http://localhost:3000`  
**API Key:** `WATER_TANK_API_KEY_2024_SECURE`

---

## 📋 Table of Contents

1. [Health Check](#1-health-check)
2. [Root Endpoint](#2-root-endpoint)
3. [POST /api/water-level](#3-post-apwater-level)
4. [GET /api/latest](#4-get-apilatest)
5. [Error Scenarios](#5-error-scenarios)

---

## 1. Health Check

### Basic Health Check
```bash
curl http://localhost:3000/health
```

### Formatted Output (with jq)
```bash
curl -s http://localhost:3000/health | jq .
```

### Formatted Output (with python)
```bash
curl -s http://localhost:3000/health | python3 -m json.tool
```

---

## 2. Root Endpoint

### Get API Information
```bash
curl http://localhost:3000/
```

### Formatted Output
```bash
curl -s http://localhost:3000/ | python3 -m json.tool
```

---

## 3. POST /api/water-level

### ✅ Valid Request (Complete Data)
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }'
```

**Expected Response:** `OK`

### ✅ Valid Request (Minimal Data)
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_002",
    "distanceCm": "20.0",
    "waterLevelCm": "80.0",
    "waterPercentage": "80.0",
    "tankHeightCm": "100"
  }'
```

### ✅ Valid Request (One Line)
```bash
curl -X POST http://localhost:3000/api/water-level -H "Content-Type: application/json" -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" -d '{"deviceId":"ESP32_003","distanceCm":"25.0","waterLevelCm":"75.0","waterPercentage":"75.0","tankHeightCm":"100","timestamp":"2024-01-15T10:30:45.123Z"}'
```

### ✅ Valid Request (Using Current Timestamp)
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d "{
    \"deviceId\": \"ESP32_001\",
    \"distanceCm\": \"15.5\",
    \"waterLevelCm\": \"84.5\",
    \"waterPercentage\": \"75.5\",
    \"tankHeightCm\": \"100\",
    \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\"
  }"
```

### ✅ Valid Request (From File)
Create a file `test-data.json`:
```json
{
  "deviceId": "ESP32_001",
  "distanceCm": "15.5",
  "waterLevelCm": "84.5",
  "waterPercentage": "75.5",
  "tankHeightCm": "100",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

Then run:
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d @test-data.json
```

---

## 4. GET /api/latest

### Basic Request
```bash
curl http://localhost:3000/api/latest
```

### Formatted Output (with jq)
```bash
curl -s http://localhost:3000/api/latest | jq .
```

### Formatted Output (with python)
```bash
curl -s http://localhost:3000/api/latest | python3 -m json.tool
```

### Verbose Output (See Headers)
```bash
curl -v http://localhost:3000/api/latest
```

---

## 5. Error Scenarios

### ❌ POST Without API Key
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100"
  }'
```

**Expected Response:** `{"success":false,"error":"API key required",...}`

### ❌ POST With Wrong API Key
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: wrong-key" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100"
  }'
```

**Expected Response:** `{"success":false,"error":"Invalid API key",...}`

### ❌ POST With Missing deviceId
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100"
  }'
```

**Expected Response:** `{"success":false,"error":"Validation failed","errors":["deviceId is required..."]}`

### ❌ POST With Invalid Numeric Value
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "invalid",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100"
  }'
```

**Expected Response:** `{"success":false,"error":"Validation failed","errors":["distanceCm must be a valid number..."]}`

### ❌ POST With Negative Value
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "-10",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100"
  }'
```

**Expected Response:** `{"success":false,"error":"Validation failed","errors":["distanceCm must be a valid number between 0 and 10000"]}`

### ❌ POST With Invalid Timestamp
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100",
    "timestamp": "invalid-date"
  }'
```

**Expected Response:** `{"success":false,"error":"Validation failed","errors":["timestamp must be a valid ISO 8601 date string"]}`

### ❌ POST With Too Large Payload (Over 10KB)
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d "{\"deviceId\":\"ESP32_001\",\"data\":\"$(python3 -c 'print("x" * 15000)')\"}"
```

**Expected Response:** Error about payload too large

### ❌ GET Invalid Endpoint
```bash
curl http://localhost:3000/api/invalid
```

**Expected Response:** `{"success":false,"message":"Endpoint not found","path":"/api/invalid"}`

---

## 🔄 Complete Test Sequence

### Test All Endpoints in Sequence
```bash
# 1. Health Check
echo "=== 1. Health Check ==="
curl -s http://localhost:3000/health | python3 -m json.tool
echo ""

# 2. Root Endpoint
echo "=== 2. Root Endpoint ==="
curl -s http://localhost:3000/ | python3 -m json.tool
echo ""

# 3. POST Valid Data
echo "=== 3. POST Valid Data ==="
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }'
echo ""
echo ""

# 4. GET Latest Data
echo "=== 4. GET Latest Data ==="
curl -s http://localhost:3000/api/latest | python3 -m json.tool
echo ""
```

---

## 📊 Testing with Verbose Output

### See Full Request/Response Headers
```bash
curl -v -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100"
  }'
```

### See Only Response Headers
```bash
curl -I http://localhost:3000/api/latest
```

---

## 🧪 Quick Test Script

Save this as `quick-curl-test.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
API_KEY="WATER_TANK_API_KEY_2024_SECURE"

echo "🧪 Testing Water Tank API with CURL"
echo "===================================="
echo ""

# Health
echo "1. Health Check:"
curl -s "$BASE_URL/health" | python3 -m json.tool | head -5
echo ""

# POST
echo "2. POST /api/water-level:"
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
echo ""

# GET
echo "3. GET /api/latest:"
curl -s "$BASE_URL/api/latest" | python3 -m json.tool
echo ""

echo "✅ Test Complete!"
```

Make it executable and run:
```bash
chmod +x quick-curl-test.sh
./quick-curl-test.sh
```

---

## 🔍 Monitoring Commands

### Watch Latest Data (Updates every 2 seconds)
```bash
watch -n 2 'curl -s http://localhost:3000/api/latest | python3 -m json.tool'
```

### Watch Health Status
```bash
watch -n 5 'curl -s http://localhost:3000/health | python3 -m json.tool'
```

### Continuous POST Test (Every 5 seconds)
```bash
while true; do
  curl -X POST http://localhost:3000/api/water-level \
    -H "Content-Type: application/json" \
    -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
    -d "{
      \"deviceId\": \"ESP32_001\",
      \"distanceCm\": \"$(shuf -i 10-30 -n 1).5\",
      \"waterLevelCm\": \"$(shuf -i 70-90 -n 1).5\",
      \"waterPercentage\": \"$(shuf -i 70-90 -n 1).5\",
      \"tankHeightCm\": \"100\",
      \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\"
    }"
  echo ""
  sleep 5
done
```

---

## 📝 Common Use Cases

### Test Multiple Devices
```bash
# Device 1
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"deviceId":"ESP32_001","distanceCm":"15.5","waterLevelCm":"84.5","waterPercentage":"75.5","tankHeightCm":"100"}'

# Device 2
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"deviceId":"ESP32_002","distanceCm":"20.0","waterLevelCm":"80.0","waterPercentage":"80.0","tankHeightCm":"100"}'

# Device 3
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"deviceId":"ESP32_003","distanceCm":"25.0","waterLevelCm":"75.0","waterPercentage":"75.0","tankHeightCm":"100"}'

# Check latest (should be Device 3)
curl -s http://localhost:3000/api/latest | python3 -m json.tool
```

### Test Rate Limiting
```bash
# Send 10 rapid requests
for i in {1..10}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/water-level \
    -H "Content-Type: application/json" \
    -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
    -d "{\"deviceId\":\"ESP32_001\",\"distanceCm\":\"15.5\",\"waterLevelCm\":\"84.5\",\"waterPercentage\":\"75.5\",\"tankHeightCm\":\"100\"}"
  echo ""
  sleep 1
done
```

---

## 🎯 Summary

**Most Common Commands:**

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **POST Data:**
   ```bash
   curl -X POST http://localhost:3000/api/water-level \
     -H "Content-Type: application/json" \
     -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
     -d '{"deviceId":"ESP32_001","distanceCm":"15.5","waterLevelCm":"84.5","waterPercentage":"75.5","tankHeightCm":"100"}'
   ```

3. **GET Latest:**
   ```bash
   curl http://localhost:3000/api/latest
   ```

**Happy Testing! 🚀**

