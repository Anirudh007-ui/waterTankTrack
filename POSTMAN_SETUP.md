# Postman Setup Guide - Local API Testing

## 🔴 The Problem

When testing `http://localhost:3000` in Postman's browser version, you'll see:
- **Error:** "Cloud agent error: cannot send request"
- **Reason:** Browser security restrictions prevent Postman from accessing localhost URLs

---

## ✅ Solutions

### Solution 1: Use Postman Desktop App (Recommended)

**Download and Install:**
1. Go to [postman.com/downloads](https://www.postman.com/downloads/)
2. Download Postman Desktop App for macOS
3. Install and open the app
4. The desktop app can access localhost without issues

**Benefits:**
- ✅ Works with localhost URLs
- ✅ No agent needed
- ✅ Full Postman features
- ✅ Better performance

---

### Solution 2: Use Postman Desktop Agent

**If you prefer browser version:**

1. **Download Desktop Agent:**
   - Click "Download Desktop Agent" button in the error message
   - Or visit: [postman.com/downloads/agent](https://www.postman.com/downloads/agent)

2. **Install and Run:**
   - Install the agent
   - Keep it running in the background
   - Postman browser will connect through the agent

3. **Switch Browser (if using Safari):**
   - Safari doesn't support the desktop agent
   - Use Chrome, Firefox, or Edge instead

---

### Solution 3: Use CURL Commands (Easiest)

**No installation needed!** Use the curl commands we provided:

```bash
# Health Check
curl http://localhost:3000/health

# GET Latest Data
curl http://localhost:3000/api/latest

# POST Data
curl -X POST http://localhost:3000/api/water-level \
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

**See `CURL_COMMANDS.md` for complete reference!**

---

### Solution 4: Use Quick Test Scripts

We've created test scripts that work perfectly:

```bash
# Quick test
./quick-curl-test.sh

# Comprehensive test
./test-local.sh

# Load test
node load-test.js
```

---

## 📋 Postman Collection Setup

If you want to use Postman Desktop App, here's how to set it up:

### 1. Create New Request - GET /api/latest

**Method:** GET  
**URL:** `http://localhost:3000/api/latest`  
**Headers:** None needed

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "deviceId": "ESP32_001",
    "distanceCm": "15.5",
    "waterLevelCm": "84.5",
    "waterPercentage": "75.5",
    "tankHeightCm": "100",
    "timestamp": "2024-01-15T10:30:45.123Z"
  },
  "lastUpdate": "2024-01-15T10:30:45.123Z",
  "ageSeconds": 3
}
```

---

### 2. Create New Request - POST /api/water-level

**Method:** POST  
**URL:** `http://localhost:3000/api/water-level`

**Headers:**
```
Content-Type: application/json
x-api-key: WATER_TANK_API_KEY_2024_SECURE
```

**Body (raw JSON):**
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

**Expected Response:** `OK`

---

### 3. Create New Request - GET /health

**Method:** GET  
**URL:** `http://localhost:3000/health`  
**Headers:** None needed

**Expected Response:**
```json
{
  "status": "healthy",
  "uptime": "1h 30m 15s",
  "uptimeSeconds": 5415,
  "timestamp": "2024-01-15T10:30:45.123Z",
  "memory": {
    "heapUsed": "8 MB",
    "heapTotal": "11 MB",
    "rss": "37 MB"
  },
  "hasData": true,
  "lastUpdate": "2024-01-15T10:30:42.000Z"
}
```

---

## 🎯 Quick Fix Summary

**Easiest Solution:** Use curl commands (already working!)

```bash
# Test GET endpoint
curl http://localhost:3000/api/latest

# Test POST endpoint
curl -X POST http://localhost:3000/api/water-level \
  -H "Content-Type: application/json" \
  -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
  -d '{"deviceId":"ESP32_001","distanceCm":"15.5","waterLevelCm":"84.5","waterPercentage":"75.5","tankHeightCm":"100"}'
```

**Best Solution:** Download Postman Desktop App

1. Visit: https://www.postman.com/downloads/
2. Download for macOS
3. Install and use - it works with localhost!

---

## 🔍 Why This Happens

- **Browser Security:** Browsers block direct access to localhost from web apps
- **CORS/Security:** Prevents web-based tools from accessing local servers
- **Safari Limitation:** Safari doesn't support Postman Desktop Agent
- **Solution:** Desktop app or agent bypasses browser restrictions

---

## ✅ Recommended Approach

**For Quick Testing:** Use curl commands (instant, no setup)  
**For API Development:** Use Postman Desktop App (better UI, collections)  
**For Automation:** Use our test scripts (bash/Node.js)

All methods work perfectly! Choose what's most convenient for you. 🚀

