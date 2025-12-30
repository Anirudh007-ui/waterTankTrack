# Security Implementation Guide - Use Cases & Examples

This document explains all security changes made to the API and provides real-world use case examples.

---

## 🔐 Security Changes Implemented

### 1. **API Key Authentication** (POST `/api/water-level`)
### 2. **Rate Limiting** (Both POST and GET)
### 3. **CORS Restrictions** (Configurable)
### 4. **Input Validation** (POST endpoint)
### 5. **Request Size Limiting** (10KB max)
### 6. **Error Handling** (Production-safe)

---

## 1. API Key Authentication

### **What Changed:**
- POST `/api/water-level` now requires API key in header
- Hardcoded key: `WATER_TANK_API_KEY_2024_SECURE` (easy for IoT)
- Can be overridden with environment variable: `API_KEY`

### **Use Case Example 1: ESP32 IoT Device**

**Scenario:** Your ESP32 device needs to send water level data every 5 seconds.

**ESP32 Arduino Code:**
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://your-app.onrender.com/api/water-level";
const char* apiKey = "WATER_TANK_API_KEY_2024_SECURE"; // Hardcoded in device

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey); // ← API KEY IN HEADER
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["deviceId"] = "ESP32_001";
    doc["distanceCm"] = "15.5";
    doc["waterLevelCm"] = "84.5";
    doc["waterPercentage"] = "75.5";
    doc["tankHeightCm"] = "100";
    doc["timestamp"] = "2024-01-15T10:30:45.123Z";
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Data sent successfully");
    } else if (httpResponseCode == 401) {
      Serial.println("❌ API key missing");
    } else if (httpResponseCode == 403) {
      Serial.println("❌ Invalid API key");
    } else {
      Serial.print("❌ Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  }
  
  delay(5000); // Send every 5 seconds
}
```

**Benefits:**
- ✅ Prevents unauthorized devices from sending fake data
- ✅ Easy to implement (just add one header)
- ✅ Hardcoded key works well for IoT devices (no key management needed)

**Testing:**
```bash
# ✅ Valid request with API key
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

# ❌ Request without API key (will fail)
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "ESP32_001"}'
# Response: {"success":false,"error":"API key required"}

# ❌ Request with wrong API key (will fail)
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: wrong-key" \
  -d '{"deviceId": "ESP32_001"}'
# Response: {"success":false,"error":"Invalid API key"}
```

---

## 2. Rate Limiting

### **What Changed:**
- POST requests: 200 per 15 minutes per IP
- GET requests: 60 per minute per IP
- Prevents DoS attacks and abuse

### **Use Case Example 2: Normal IoT Operation**

**Scenario:** ESP32 sends data every 5 seconds (12 requests/minute, 180 requests/15 minutes)

**Result:** ✅ Well within limits (200/15min for POST)

### **Use Case Example 3: Mobile App Dashboard**

**Scenario:** Mobile app polls for latest data every 10 seconds (6 requests/minute)

**Result:** ✅ Well within limits (60/min for GET)

### **Use Case Example 4: Attack Prevention**

**Scenario:** Attacker tries to flood API with 1000 requests/second

**Result:** ❌ Blocked after 200 requests in 15 minutes (POST) or 60 requests/minute (GET)

**Response when rate limited:**
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

**Testing:**
```bash
# Send 10 rapid requests (should work)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/water-level \
    -H "Content-Type: application/json" \
    -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
    -d '{"deviceId":"ESP32_001","distanceCm":"15.5","waterLevelCm":"84.5","waterPercentage":"75.5","tankHeightCm":"100"}'
  echo ""
done

# After exceeding limit, you'll get rate limit error
```

---

## 3. CORS Restrictions

### **What Changed:**
- Configurable allowed origins
- Default: Allow all (for development)
- Production: Set `ALLOWED_ORIGINS` environment variable

### **Use Case Example 5: Web Dashboard**

**Scenario:** Your web dashboard at `https://dashboard.example.com` needs to fetch data

**Configuration:**
```bash
# In production, set environment variable
export ALLOWED_ORIGINS="https://dashboard.example.com,https://app.example.com"
```

**JavaScript Fetch Example:**
```javascript
// This will work if origin is in ALLOWED_ORIGINS
fetch('https://your-api.onrender.com/api/latest', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Water Level:', data.data.waterPercentage);
  updateDashboard(data);
})
.catch(error => {
  console.error('Error:', error);
});
```

**Use Case Example 6: Mobile App (No CORS Issues)**

**Scenario:** React Native or native mobile app

**Result:** ✅ Mobile apps don't have CORS restrictions (no browser), so they work fine

---

## 4. Input Validation

### **What Changed:**
- Validates `deviceId` (required, string, max 50 chars)
- Validates numeric fields (0-10000 range)
- Validates timestamp format (ISO 8601)

### **Use Case Example 7: Invalid Data Prevention**

**Scenario:** IoT device sends corrupted or malicious data

**Invalid Request 1: Missing deviceId**
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"distanceCm": "15.5"}'
```
**Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["deviceId is required and must be a non-empty string"]
}
```

**Invalid Request 2: Invalid numeric value**
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "waterPercentage": "invalid"
  }'
```
**Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["waterPercentage must be a valid number between 0 and 10000"]
}
```

**Invalid Request 3: Negative value**
```bash
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{
    "deviceId": "ESP32_001",
    "waterLevelCm": "-10"
  }'
```
**Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["waterLevelCm must be a valid number between 0 and 10000"]
}
```

**Valid Request:**
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
**Response:** `OK` ✅

---

## 5. Request Size Limiting

### **What Changed:**
- JSON payloads limited to 10KB
- Prevents memory exhaustion attacks

### **Use Case Example 8: Large Payload Attack**

**Scenario:** Attacker tries to send 1MB JSON payload

**Result:** ❌ Request rejected before processing

**Testing:**
```bash
# Create a large payload (over 10KB)
python3 -c "
import json
data = {'deviceId': 'ESP32_001', 'data': 'x' * 15000}
print(json.dumps(data))
" | curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d @-
# Response: Payload too large error
```

---

## 6. GET Endpoint - Standard Approach

### **What Changed:**
- No authentication required (public read access)
- Rate limited (60 requests/minute)
- Returns structured JSON with metadata

### **Use Case Example 9: Mobile App Real-time Display**

**Scenario:** React Native app displays current water level

**React Native Code:**
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WaterLevelDisplay = () => {
  const [waterData, setWaterData] = useState(null);
  const API_URL = 'https://your-api.onrender.com/api/latest';

  useEffect(() => {
    // Poll every 10 seconds
    const interval = setInterval(() => {
      fetch(API_URL)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setWaterData(data.data);
          }
        })
        .catch(error => console.error('Error:', error));
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!waterData) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Tank Level</Text>
      <Text style={styles.percentage}>
        {waterData.waterPercentage}%
      </Text>
      <Text style={styles.details}>
        Level: {waterData.waterLevelCm} cm
      </Text>
      <Text style={styles.details}>
        Device: {waterData.deviceId}
      </Text>
    </View>
  );
};
```

### **Use Case Example 10: Web Dashboard with Polling**

**Scenario:** Vue.js dashboard with auto-refresh

**Vue.js Code:**
```vue
<template>
  <div class="dashboard">
    <h1>Water Tank Monitor</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div class="water-level">
        <h2>{{ waterData.waterPercentage }}%</h2>
        <p>Level: {{ waterData.waterLevelCm }} cm</p>
        <p>Last Update: {{ formatTime(waterData.timestamp) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      waterData: null,
      loading: true,
      error: null,
      API_URL: 'https://your-api.onrender.com/api/latest'
    };
  },
  mounted() {
    this.fetchData();
    // Poll every 15 seconds
    this.interval = setInterval(this.fetchData, 15000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch(this.API_URL);
        const data = await response.json();
        
        if (data.success) {
          this.waterData = data.data;
          this.loading = false;
        } else {
          this.error = data.message;
        }
      } catch (error) {
        this.error = 'Failed to fetch data';
        console.error(error);
      }
    },
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString();
    }
  }
};
</script>
```

### **Use Case Example 11: Monitoring System Integration**

**Scenario:** External monitoring system checks water level for alerts

**Python Script:**
```python
import requests
import time
from datetime import datetime

API_URL = "https://your-api.onrender.com/api/latest"
ALERT_THRESHOLD = 20  # Alert if water level below 20%

def check_water_level():
    try:
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        
        if data['success']:
            water_percentage = float(data['data']['waterPercentage'])
            
            if water_percentage < ALERT_THRESHOLD:
                send_alert(f"⚠️ Low water level: {water_percentage}%")
            
            print(f"[{datetime.now()}] Water Level: {water_percentage}%")
        else:
            print(f"Error: {data['message']}")
            
    except Exception as e:
        print(f"Error fetching data: {e}")

# Check every 30 seconds
while True:
    check_water_level()
    time.sleep(30)
```

---

## 📋 Complete Testing Guide

### Test All Security Features:

```bash
# 1. Test API Key Authentication
echo "=== Test 1: Valid API Key ==="
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"deviceId":"ESP32_001","distanceCm":"15.5","waterLevelCm":"84.5","waterPercentage":"75.5","tankHeightCm":"100"}'

echo -e "\n=== Test 2: Missing API Key ==="
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"ESP32_001"}'

echo -e "\n=== Test 3: Invalid API Key ==="
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: wrong-key" \
  -d '{"deviceId":"ESP32_001"}'

# 2. Test Input Validation
echo -e "\n=== Test 4: Missing deviceId ==="
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"distanceCm":"15.5"}'

echo -e "\n=== Test 5: Invalid numeric value ==="
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"deviceId":"ESP32_001","waterPercentage":"invalid"}'

# 3. Test GET Endpoint (No auth required)
echo -e "\n=== Test 6: GET Latest Data ==="
curl http://localhost:3000/api/latest

# 4. Test Rate Limiting (send many requests)
echo -e "\n=== Test 7: Rate Limiting ==="
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/water-level \
    -H "Content-Type: application/json" \
    -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
    -d '{"deviceId":"ESP32_001","distanceCm":"15.5","waterLevelCm":"84.5","waterPercentage":"75.5","tankHeightCm":"100"}' &
done
wait
```

---

## 🔧 Configuration Options

### Environment Variables:

```bash
# API Key (optional, defaults to hardcoded value)
export API_KEY="your-custom-api-key"

# Allowed CORS origins (comma-separated)
export ALLOWED_ORIGINS="https://dashboard.example.com,https://app.example.com"

# Node environment
export NODE_ENV="production"
```

### For Render.com Deployment:

1. Go to your Render service dashboard
2. Click "Environment" tab
3. Add environment variables:
   - `API_KEY`: Your custom API key
   - `ALLOWED_ORIGINS`: Your allowed domains
   - `NODE_ENV`: `production`

---

## ✅ Summary

| Feature | Status | Use Case |
|---------|--------|----------|
| API Key Auth | ✅ Implemented | Prevents unauthorized IoT devices |
| Rate Limiting | ✅ Implemented | Prevents DoS attacks |
| CORS | ✅ Configurable | Allows web dashboards |
| Input Validation | ✅ Implemented | Prevents invalid data |
| Size Limiting | ✅ 10KB max | Prevents memory attacks |
| GET Endpoint | ✅ Public access | Mobile/web apps can read data |

All security features are IoT-friendly and easy to integrate! 🚀

