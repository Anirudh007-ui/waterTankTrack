# Load Test Script - IoT Simulation

## Overview

The `load-test.js` script simulates multiple IoT devices sending water level data to test the API under load conditions.

---

## Quick Start

### 1. Start the Server
```bash
npm start
```

### 2. Run Load Test (Default: 5 devices, 60s interval, 5 minutes)
```bash
node load-test.js
```

### 3. Custom Load Test
```bash
# 10 devices, 30 second interval, 10 minutes duration
node load-test.js --devices=10 --interval=30 --duration=10

# 20 devices, 1 minute interval, 15 minutes duration
node load-test.js --devices=20 --interval=60 --duration=15
```

---

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--devices=N` | Number of IoT devices to simulate | 5 |
| `--interval=N` | Interval between requests (seconds) | 60 |
| `--duration=N` | Test duration (minutes) | 5 |
| `--url=URL` | API URL | http://localhost:3000 |
| `--api-key=KEY` | API key | WATER_TANK_API_KEY_2024_SECURE |

---

## Examples

### Example 1: Light Load (Development)
```bash
# 3 devices, 1 minute interval, 3 minutes
node load-test.js --devices=3 --interval=60 --duration=3
```

**Use Case:** Testing basic functionality

### Example 2: Normal IoT Load
```bash
# 10 devices, 1 minute interval, 10 minutes
node load-test.js --devices=10 --interval=60 --duration=10
```

**Use Case:** Simulating real-world scenario with 10 water tanks

### Example 3: High Load Test
```bash
# 50 devices, 30 second interval, 5 minutes
node load-test.js --devices=50 --interval=30 --duration=5
```

**Use Case:** Stress testing rate limits and server capacity

### Example 4: Production URL Test
```bash
# Test against production server
node load-test.js \
  --url=https://your-app.onrender.com \
  --devices=5 \
  --interval=60 \
  --duration=5
```

---

## Output

### During Test:
```
🚀 Starting IoT Load Test
============================================================
Devices: 5
Interval: 60 seconds
Duration: 5 minutes
API URL: http://localhost:3000
============================================================

🔍 Testing connection...
✅ Connection successful!

📡 Starting 5 IoT devices...

✅ Device ESP32_001: 75.5% (200)
✅ Device ESP32_002: 82.3% (200)
✅ Device ESP32_003: 68.9% (200)
...
```

### Final Statistics:
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

---

## IoT Scenario Simulation

### Real-World Scenario: 10 Water Tanks

Each tank has an ESP32 device that:
- Sends data every 1 minute
- Reports water level, distance, and percentage
- Includes device ID and timestamp

**Command:**
```bash
node load-test.js --devices=10 --interval=60 --duration=60
```

**Result:**
- 10 devices × 60 requests = 600 total requests
- 1 request per minute per device
- Tests rate limiting (200 requests per 15 minutes per IP)
- Simulates 1 hour of operation

---

## Rate Limit Testing

### Test Rate Limits

**POST Rate Limit:** 200 requests per 15 minutes per IP

```bash
# This will trigger rate limiting
node load-test.js --devices=1 --interval=5 --duration=20
# 1 device × 240 requests (20 min / 5 sec) = 240 requests
# Will hit rate limit after 200 requests
```

**Expected:** Some requests will fail with rate limit error after 200 requests.

---

## Monitoring During Test

### Terminal 1: Run Load Test
```bash
node load-test.js --devices=10 --interval=30 --duration=10
```

### Terminal 2: Monitor Server
```bash
# Watch server logs (if logging enabled)
ENABLE_LOGGING=true npm start

# Or check health endpoint
watch -n 5 'curl -s http://localhost:3000/health | python3 -m json.tool'
```

### Terminal 3: Monitor Latest Data
```bash
# Watch latest data updates
watch -n 2 'curl -s http://localhost:3000/api/latest | python3 -m json.tool'
```

---

## Troubleshooting

### Connection Failed
```
❌ Connection failed! Make sure server is running.
```

**Solution:**
1. Start the server: `npm start`
2. Check if server is running: `curl http://localhost:3000/health`
3. Verify URL: `--url=http://localhost:3000`

### API Key Error
```
❌ Device ESP32_001: HTTP 403 - Invalid API key
```

**Solution:**
1. Check API key in server.js
2. Use correct API key: `--api-key=WATER_TANK_API_KEY_2024_SECURE`
3. Or set environment variable: `export API_KEY=your-key`

### Rate Limit Errors
```
❌ Device ESP32_001: HTTP 429 - Too many requests
```

**Solution:**
- This is expected behavior when testing rate limits
- Reduce number of devices or increase interval
- Or test with different IP addresses

---

## Performance Metrics

The script tracks:
- ✅ Total requests
- ✅ Successful requests
- ❌ Failed requests
- 📈 Requests per minute
- 📈 Requests per second
- ⚠️ Error details

---

## Best Practices

1. **Start Small:** Begin with 3-5 devices
2. **Gradual Increase:** Increase devices gradually
3. **Monitor Resources:** Watch server memory/CPU
4. **Test Rate Limits:** Verify rate limiting works
5. **Production Testing:** Test against production with caution

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Load Test
  run: |
    npm start &
    sleep 5
    node load-test.js --devices=5 --interval=30 --duration=2
```

---

## Summary

The load test script helps you:
- ✅ Test API under load
- ✅ Verify rate limiting
- ✅ Simulate real IoT scenarios
- ✅ Monitor performance
- ✅ Identify bottlenecks

**Happy Testing! 🚀**

