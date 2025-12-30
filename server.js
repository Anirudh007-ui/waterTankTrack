/**
 * IoT Pub/Sub API Server - Water Tank Level Tracker
 * 
 * A lightweight in-memory Pub/Sub API for high-frequency IoT data updates.
 * Stores only the most recent message in RAM (no database).
 * 
 * Endpoints:
 * - POST /api/water-level: Accepts water level data from IoT device
 * - GET /api/latest: Returns the most recent water level data
 * - GET /health: Health check with server status and uptime
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Server start time for uptime calculation
const SERVER_START_TIME = Date.now();

// ============================================================================
// LOGGING CONFIGURATION (Minimal for free tier infrastructure)
// ============================================================================
// Enable logging via environment variable: ENABLE_LOGGING=true
// Default: false (off) to minimize resource usage on free tiers
const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true';

// Minimal logging utility - only logs if flag is enabled
const logger = {
  log: (...args) => {
    if (ENABLE_LOGGING) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (ENABLE_LOGGING) {
      console.warn(...args);
    }
  },
  // Errors are always logged (critical)
  error: (...args) => {
    console.error(...args);
  },
  // Info level (only if logging enabled)
  info: (...args) => {
    if (ENABLE_LOGGING) {
      console.log(...args);
    }
  }
};

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================
// API Key for IoT device authentication
// Option 1: Hardcoded key (easy for IoT devices - change this!)
// Option 2: Use environment variable: process.env.API_KEY || 'your-hardcoded-key'
const API_KEY = process.env.API_KEY || 'WATER_TANK_API_KEY_2024_SECURE';

// Allowed CORS origins (for production, restrict to specific domains)
// For IoT devices, you may need to allow all origins, but restrict in production
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*']; // Allow all in development, restrict in production

// ============================================================================
// IN-MEMORY BUFFER (Global Variable)
// ============================================================================
// This is our "database" - a simple object stored in RAM.
// On server restart, this will be empty (data loss is acceptable).
let latestData = null;
let lastUpdateTimestamp = null;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// 1. CORS Configuration - Restrict to allowed origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, IoT devices, or curl)
    if (!origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 2. Parse JSON request bodies with size limit (10KB max)
// This prevents large payload attacks
app.use(express.json({ limit: '10kb' }));

// 3. Rate Limiting - Prevent abuse and DoS attacks
// Different limits for POST (IoT updates) vs GET (client reads)
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Allow 200 POST requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const getLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Allow 60 GET requests per minute per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Request logging middleware (minimal, flag-based)
app.use((req, res, next) => {
  // Only log requests if logging is enabled
  logger.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// 5. API Key Authentication Middleware (for POST requests)
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide API key in header: x-api-key'
    });
  }
  
  if (apiKey !== API_KEY) {
    // Security warnings are always logged (critical)
    logger.warn(`[SECURITY] Invalid API key attempt from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  next();
};

// 6. Input Validation Middleware for Water Level Data
const validateWaterLevel = (req, res, next) => {
  const { deviceId, distanceCm, waterLevelCm, waterPercentage, tankHeightCm, timestamp } = req.body;
  const errors = [];
  
  // Validate deviceId (required, string, max 50 chars)
  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0) {
    errors.push('deviceId is required and must be a non-empty string');
  } else if (deviceId.length > 50) {
    errors.push('deviceId must be 50 characters or less');
  }
  
  // Validate numeric fields (optional but must be valid if provided)
  const numericFields = [
    { name: 'distanceCm', value: distanceCm },
    { name: 'waterLevelCm', value: waterLevelCm },
    { name: 'waterPercentage', value: waterPercentage },
    { name: 'tankHeightCm', value: tankHeightCm }
  ];
  
  numericFields.forEach(field => {
    if (field.value !== undefined && field.value !== null) {
      const numValue = parseFloat(field.value);
      if (isNaN(numValue) || numValue < 0 || numValue > 10000) {
        errors.push(`${field.name} must be a valid number between 0 and 10000`);
      }
    }
  });
  
  // Validate timestamp format if provided
  if (timestamp && typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      errors.push('timestamp must be a valid ISO 8601 date string');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/water-level
 * 
 * Accepts water level data from IoT device (e.g., ESP32).
 * Updates the in-memory buffer with the latest data.
 * 
 * Security: Requires API key in header (x-api-key)
 * Rate Limit: 200 requests per 15 minutes per IP
 * 
 * Request Headers:
 *   x-api-key: WATER_TANK_API_KEY_2024_SECURE (or from env)
 * 
 * Request Body: WaterLevelRequest JSON object
 * Example: {
 *   "deviceId": "ESP32_001",
 *   "distanceCm": "15.5",
 *   "waterLevelCm": "84.5",
 *   "waterPercentage": "75.5",
 *   "tankHeightCm": "100",
 *   "timestamp": "2024-01-15T10:30:45.123Z"
 * }
 * 
 * Response: 200 OK with plain text "OK" (matches Java controller)
 * 
 * Use Case: IoT device (ESP32) sends water level readings every 5 seconds
 * - Device includes API key in header for authentication
 * - Server validates data format and values
 * - Rate limiting prevents abuse while allowing normal IoT frequency
 */
app.post('/api/water-level', postLimiter, authenticateAPI, validateWaterLevel, (req, res) => {
  try {
    const request = req.body;
    
    // Update the in-memory buffer with incoming data
    latestData = {
      deviceId: request.deviceId || null,
      distanceCm: request.distanceCm || null,
      waterLevelCm: request.waterLevelCm || null,
      waterPercentage: request.waterPercentage || null,
      tankHeightCm: request.tankHeightCm || null,
      timestamp: request.timestamp || new Date().toISOString()
    };
    lastUpdateTimestamp = Date.now();
    
    // Minimal logging - only if flag is enabled (saves resources on free tier)
    if (ENABLE_LOGGING) {
      logger.log('📡 Water Level Data Received');
      logger.log(`Device: ${latestData.deviceId}, Level: ${latestData.waterLevelCm}cm, %: ${latestData.waterPercentage}`);
    }
    
    // Return plain text "OK" to match Java controller response
    res.status(200).type('text/plain').send('OK');
  } catch (error) {
    // Errors are always logged (critical)
    logger.error('[ERROR] Failed to update water level data:', error);
    res.status(500).type('text/plain').send('Internal server error');
  }
});

/**
 * GET /api/latest
 * 
 * Returns the most recent water level data stored in the in-memory buffer.
 * 
 * Security: Public endpoint (no authentication required)
 * Rate Limit: 60 requests per minute per IP
 * 
 * Response: 200 OK with latest water level data, or 404 if no data exists yet
 * 
 * Use Cases:
 * 1. Mobile App Dashboard: Polls every 10-30 seconds to display current water level
 * 2. Web Dashboard: Real-time updates using polling or WebSocket fallback
 * 3. Monitoring System: Health checks and alerting based on water level
 * 4. Third-party Integrations: External systems fetching latest readings
 * 
 * Standard Approach:
 * - No authentication required (public read access)
 * - Rate limited to prevent abuse
 * - Returns structured JSON with metadata
 * - Includes ageSeconds for cache control
 */
app.get('/api/latest', getLimiter, (req, res) => {
  try {
    if (latestData === null) {
      // No data has been received yet
      res.status(404).json({
        success: false,
        message: 'No water level data available yet',
        data: null
      });
    } else {
      // Return the latest water level data along with metadata
      res.status(200).json({
        success: true,
        data: {
          deviceId: latestData.deviceId,
          distanceCm: latestData.distanceCm,
          waterLevelCm: latestData.waterLevelCm,
          waterPercentage: latestData.waterPercentage,
          tankHeightCm: latestData.tankHeightCm,
          timestamp: latestData.timestamp
        },
        lastUpdate: new Date(lastUpdateTimestamp).toISOString(),
        ageSeconds: Math.floor((Date.now() - lastUpdateTimestamp) / 1000)
      });
    }
  } catch (error) {
    // Errors are always logged (critical)
    logger.error('[ERROR] Failed to retrieve latest water level data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /health
 * 
 * Health check endpoint for monitoring and deployment verification.
 * Returns server status, uptime, and memory usage.
 * 
 * Response: 200 OK with health information
 */
app.get('/health', (req, res) => {
  try {
    const uptimeMs = Date.now() - SERVER_START_TIME;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);
    
    // Format uptime string
    let uptimeString = '';
    if (uptimeDays > 0) uptimeString += `${uptimeDays}d `;
    if (uptimeHours % 24 > 0) uptimeString += `${uptimeHours % 24}h `;
    if (uptimeMinutes % 60 > 0) uptimeString += `${uptimeMinutes % 60}m `;
    uptimeString += `${uptimeSeconds % 60}s`;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      uptime: uptimeString,
      uptimeSeconds: uptimeSeconds,
      timestamp: new Date().toISOString(),
      serverStartTime: new Date(SERVER_START_TIME).toISOString(),
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
      },
      hasData: latestData !== null,
      lastUpdate: lastUpdateTimestamp ? new Date(lastUpdateTimestamp).toISOString() : null
    });
  } catch (error) {
    // Errors are always logged (critical)
    logger.error('[ERROR] Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// ============================================================================
// ROOT ENDPOINT (Optional - for quick testing)
// ============================================================================
app.get('/', (req, res) => {
  res.json({
    message: 'IoT Pub/Sub API Server - Water Tank Level Tracker',
    version: '1.0.0',
    endpoints: {
      'POST /api/water-level': 'Update the in-memory buffer with water level data',
      'GET /api/latest': 'Get the most recent water level data',
      'GET /health': 'Health check and server status'
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================
// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Errors are always logged (critical)
  logger.error('[ERROR] Unhandled error:', err);
  
  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    // Only expose error message in development
    error: isDevelopment ? err.message : undefined
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================
app.listen(PORT, () => {
  // Minimal startup message (always shown - essential for deployment verification)
  console.log(`🚀 Server started on port ${PORT} (Logging: ${ENABLE_LOGGING ? 'ON' : 'OFF'})`);
  
  // Detailed startup info only if logging enabled
  if (ENABLE_LOGGING) {
    logger.log('='.repeat(60));
    logger.log('🚀 IoT Pub/Sub API Server Started - Water Tank Level Tracker');
    logger.log('='.repeat(60));
    logger.log(`📍 Server running on port ${PORT}`);
    logger.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`⏰ Started at: ${new Date().toISOString()}`);
    logger.log('='.repeat(60));
    logger.log('\nAvailable Endpoints:');
    logger.log('  POST   /api/water-level  - Update water level data from IoT device');
    logger.log('  GET    /api/latest       - Get latest water level data');
    logger.log('  GET    /health           - Health check');
    logger.log('='.repeat(60));
  }
});


