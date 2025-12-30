# Testing Guide - Local Testing & Load Testing

## 🚀 Quick Start

### 1. Start the Server
```bash
npm start
```

You should see:
```
🚀 Server started on port 3000 (Logging: OFF)
```

### 2. Run Quick Test
```bash
./quick-test.sh
```

This tests:
- ✅ Health endpoint
- ✅ POST with API key
- ✅ GET latest data

---

## 📊 Load Testing - IoT Simulation

### Basic Load Test (Recommended)
```bash
# 5 devices, 1 minute interval, 5 minutes duration
node load-test.js
```

### Real-World IoT Scenario
```bash
# Simulate 10 water tanks sending data every 1 minute
node load-test.js --devices=10 --interval=60 --duration=10
```

**What this does:**
- Creates 10 virtual ESP32 devices
- Each device sends data every 60 seconds
- Runs for 10 minutes
- Total: ~100 requests (10 devices × 10 minutes)

### High Load Test
```bash
# 20 devices, 30 second interval, 5 minutes
node load-test.js --devices=20 --interval=30 --duration=5
```

### Rate Limit Testing
```bash
# Test rate limits (200 requests per 15 minutes)
node load-test.js --devices=1 --interval=5 --duration=20
# Will hit rate limit after 200 requests
```

---

## 📋 Load Test Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--devices=N` | Number of IoT devices | 5 | `--devices=10` |
| `--interval=N` | Seconds between requests | 60 | `--interval=30` |
| `--duration=N` | Test duration (minutes) | 5 | `--duration=10` |
| `--url=URL` | API URL | localhost:3000 | `--url=https://your-app.onrender.com` |
| `--api-key=KEY` | API key | Default key | `--api-key=your-key` |

---

## 📈 Example Scenarios

### Scenario 1: Small Farm (5 Tanks)
```bash
node load-test.js --devices=5 --interval=60 --duration=60
```
- 5 water tanks
- Data every 1 minute
- 1 hour simulation
- Total: 300 requests

### Scenario 2: Medium Farm (20 Tanks)
```bash
node load-test.js --devices=20 --interval=60 --duration=30
```
- 20 water tanks
- Data every 1 minute
- 30 minutes simulation
- Total: 600 requests

### Scenario 3: Production Testing
```bash
node load-test.js \
  --url=https://your-app.onrender.com \
  --devices=5 \
  --interval=60 \
  --duration=5
```

---

## 🧪 Manual Testing

### Test POST Endpoint
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

Expected: `OK`

### Test GET Endpoint
```bash
curl http://localhost:3000/api/latest
```

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

---

## 📊 Understanding Load Test Results

### Successful Test Output:
```
============================================================
📊 LOAD TEST RESULTS
============================================================
Test Duration: 5 minutes
Devices Simulated: 5
Request Interval: 60 seconds
API URL: http://localhost:3000
============================================================
Total Requests: 25
✅ Successful: 25 (100.00%)
❌ Failed: 0 (0.00%)
============================================================

📈 Performance:
   Requests per minute: 5.00
   Requests per second: 0.08
============================================================
```

### What to Look For:
- ✅ **Success Rate:** Should be 100% under normal load
- ✅ **Requests per minute:** Matches your device count × frequency
- ❌ **Failed requests:** Investigate if > 0%
- ⚠️ **Errors:** Check error messages for issues

---

## 🔍 Monitoring During Tests

### Terminal 1: Server (with logging)
```bash
ENABLE_LOGGING=true npm start
```

### Terminal 2: Load Test
```bash
node load-test.js --devices=10 --interval=30 --duration=5
```

### Terminal 3: Monitor Health
```bash
watch -n 5 'curl -s http://localhost:3000/health | python3 -m json.tool'
```

### Terminal 4: Monitor Latest Data
```bash
watch -n 2 'curl -s http://localhost:3000/api/latest | python3 -m json.tool'
```

---

## ⚠️ Troubleshooting

### Server Not Running
```
❌ Connection failed! Make sure server is running.
```

**Solution:**
```bash
npm start
```

### API Key Error
```
❌ Device ESP32_001: HTTP 403 - Invalid API key
```

**Solution:**
- Check API key in `server.js` (default: `WATER_TANK_API_KEY_2024_SECURE`)
- Use correct key: `--api-key=WATER_TANK_API_KEY_2024_SECURE`

### Rate Limit Errors
```
❌ Device ESP32_001: HTTP 429 - Too many requests
```

**This is expected** when testing rate limits. Reduce devices or increase interval.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

---

## 📝 Test Checklist

Before deploying to production:

- [ ] ✅ Server starts successfully
- [ ] ✅ Health endpoint works
- [ ] ✅ POST endpoint accepts data with API key
- [ ] ✅ GET endpoint returns latest data
- [ ] ✅ Load test completes successfully
- [ ] ✅ Rate limiting works (test with high load)
- [ ] ✅ Error handling works (test with invalid data)
- [ ] ✅ API key authentication works
- [ ] ✅ Input validation works

---

## 🎯 Best Practices

1. **Start Small:** Begin with 3-5 devices
2. **Gradual Increase:** Increase load gradually
3. **Monitor Resources:** Watch server memory/CPU
4. **Test Rate Limits:** Verify rate limiting works
5. **Production Testing:** Test production with caution
6. **Log Analysis:** Enable logging when debugging

---

## 📚 Files Reference

- `load-test.js` - Load test script
- `quick-test.sh` - Quick API test script
- `test-local.sh` - Comprehensive test script
- `LOAD_TEST_README.md` - Detailed load test documentation

---

## ✅ Summary

**Quick Test:**
```bash
./quick-test.sh
```

**Load Test (IoT Simulation):**
```bash
node load-test.js --devices=10 --interval=60 --duration=10
```

**Happy Testing! 🚀**

