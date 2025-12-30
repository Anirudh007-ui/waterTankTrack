# Logging Configuration Guide

## Overview

Logging is **minimal and flag-based** to optimize for free-tier infrastructure (like Render.com free tier). By default, logging is **OFF** to save resources.

---

## Default Behavior (Logging OFF)

When `ENABLE_LOGGING` is not set or set to `false`:

✅ **Always Logged (Critical Only):**
- Server startup message (minimal)
- All errors (`console.error`)
- Security warnings (invalid API key attempts)

❌ **Not Logged:**
- Request logs (method, path, IP)
- Data received logs
- Detailed startup information
- Info/debug messages

**Result:** Minimal resource usage, only critical information logged.

---

## Enable Logging

### Option 1: Environment Variable (Recommended)

**For Local Development:**
```bash
export ENABLE_LOGGING=true
npm start
```

**For Render.com:**
1. Go to your service dashboard
2. Click "Environment" tab
3. Add environment variable:
   - Key: `ENABLE_LOGGING`
   - Value: `true`

**For Production (if needed):**
```bash
ENABLE_LOGGING=true npm start
```

### Option 2: In Code (Not Recommended)

You can temporarily change the default in `server.js`:
```javascript
const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true' || true; // Force enable
```

---

## What Gets Logged When Enabled

When `ENABLE_LOGGING=true`:

### 1. **Request Logging**
```
[2024-01-15T10:30:45.123Z] POST /api/water-level - IP: ::ffff:192.168.1.1
[2024-01-15T10:30:46.123Z] GET /api/latest - IP: ::ffff:192.168.1.2
```

### 2. **Data Received Logging**
```
📡 Water Level Data Received
Device: ESP32_001, Level: 84.5cm, %: 75.5
```

### 3. **Detailed Startup Information**
```
============================================================
🚀 IoT Pub/Sub API Server Started - Water Tank Level Tracker
============================================================
📍 Server running on port 3000
🌐 Environment: production
⏰ Started at: 2024-01-15T10:30:45.123Z
============================================================

Available Endpoints:
  POST   /api/water-level  - Update water level data from IoT device
  GET    /api/latest       - Get latest water level data
  GET    /health           - Health check
============================================================
```

---

## What's Always Logged (Even When Disabled)

### 1. **Server Startup (Minimal)**
```
🚀 Server started on port 3000 (Logging: OFF)
```

### 2. **All Errors**
```
[ERROR] Failed to update water level data: Error message
[ERROR] Failed to retrieve latest water level data: Error message
[ERROR] Health check failed: Error message
[ERROR] Unhandled error: Error message
```

### 3. **Security Warnings**
```
[SECURITY] Invalid API key attempt from IP: ::ffff:192.168.1.1
```

---

## Resource Usage Comparison

### Logging OFF (Default)
- **Console Output:** ~1 line per server start + errors only
- **Memory:** Minimal (no log buffering)
- **CPU:** Minimal (no string formatting)
- **Disk I/O:** Minimal (only errors)
- **Best For:** Production, free-tier infrastructure

### Logging ON
- **Console Output:** ~10-20 lines per request
- **Memory:** Slightly higher (log formatting)
- **CPU:** Slightly higher (string operations)
- **Disk I/O:** Higher (more console writes)
- **Best For:** Development, debugging, troubleshooting

---

## Use Cases

### Use Case 1: Free Tier Deployment (Default)
```bash
# No environment variable set
# Logging: OFF
# Result: Minimal resource usage, only errors logged
```

### Use Case 2: Development/Debugging
```bash
export ENABLE_LOGGING=true
npm start
# Logging: ON
# Result: Full request and data logging for debugging
```

### Use Case 3: Production with Monitoring
```bash
# In Render.com environment variables
ENABLE_LOGGING=false  # Keep minimal
# Use external monitoring (e.g., health endpoint) instead
# Result: Minimal logging, external monitoring handles tracking
```

---

## Monitoring Without Logging

Even with logging OFF, you can still monitor:

1. **Health Endpoint:**
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **Latest Data Endpoint:**
   ```bash
   curl https://your-app.onrender.com/health
   ```

3. **Error Logs:** Always available in Render.com logs (errors are always logged)

---

## Best Practices

### ✅ Recommended:
- Keep logging **OFF** in production (free tier)
- Enable logging only when debugging issues
- Use health endpoint for monitoring
- Rely on error logs for critical issues

### ❌ Not Recommended:
- Leaving logging ON in production (wastes resources)
- Enabling logging for all environments
- Relying solely on logs for monitoring

---

## Example: Toggle Logging

**Start with logging OFF:**
```bash
npm start
# Output: 🚀 Server started on port 3000 (Logging: OFF)
```

**Enable logging:**
```bash
ENABLE_LOGGING=true npm start
# Output: Full startup info + all request logs
```

**Disable logging:**
```bash
ENABLE_LOGGING=false npm start
# Output: Minimal startup only
```

---

## Summary

| Setting | Startup Logs | Request Logs | Data Logs | Error Logs | Resource Usage |
|---------|-------------|--------------|-----------|------------|----------------|
| **OFF (Default)** | Minimal | ❌ | ❌ | ✅ | Low |
| **ON** | Full | ✅ | ✅ | ✅ | Medium |

**Default: OFF** - Optimized for free-tier infrastructure! 🚀

