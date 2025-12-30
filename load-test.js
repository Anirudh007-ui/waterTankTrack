#!/usr/bin/env node

/**
 * IoT Load Test Script
 * Simulates multiple IoT devices sending water level data
 * 
 * Usage:
 *   node load-test.js [options]
 * 
 * Options:
 *   --devices=N    Number of IoT devices to simulate (default: 5)
 *   --interval=N   Interval between requests in seconds (default: 60)
 *   --duration=N   Test duration in minutes (default: 5)
 *   --url=URL      API URL (default: http://localhost:3000)
 *   --api-key=KEY  API key (default: WATER_TANK_API_KEY_2024_SECURE)
 * 
 * Example:
 *   node load-test.js --devices=10 --interval=30 --duration=10
 */

const http = require('http');
const https = require('https');

// Configuration
const args = process.argv.slice(2);
const config = {
  devices: 5,
  interval: 60, // seconds
  duration: 5, // minutes
  url: 'http://localhost:3000',
  apiKey: 'WATER_TANK_API_KEY_2024_SECURE'
};

// Parse command line arguments
args.forEach(arg => {
  if (arg.startsWith('--devices=')) {
    config.devices = parseInt(arg.split('=')[1]) || 5;
  } else if (arg.startsWith('--interval=')) {
    config.interval = parseInt(arg.split('=')[1]) || 60;
  } else if (arg.startsWith('--duration=')) {
    config.duration = parseInt(arg.split('=')[1]) || 5;
  } else if (arg.startsWith('--url=')) {
    config.url = arg.split('=')[1];
  } else if (arg.startsWith('--api-key=')) {
    config.apiKey = arg.split('=')[1];
  }
});

// Statistics
const stats = {
  totalRequests: 0,
  successful: 0,
  failed: 0,
  errors: [],
  startTime: null,
  endTime: null
};

// Generate random water level data
function generateWaterLevelData(deviceId) {
  const tankHeight = 100; // cm
  const distance = (Math.random() * 30 + 10).toFixed(1); // 10-40 cm from sensor
  const waterLevel = (tankHeight - parseFloat(distance)).toFixed(1);
  const percentage = ((parseFloat(waterLevel) / tankHeight) * 100).toFixed(1);
  
  return {
    deviceId: `ESP32_${String(deviceId).padStart(3, '0')}`,
    distanceCm: distance,
    waterLevelCm: waterLevel,
    waterPercentage: percentage,
    tankHeightCm: String(tankHeight),
    timestamp: new Date().toISOString()
  };
}

// Send POST request
function sendWaterLevelData(deviceId, attempt = 1) {
  return new Promise((resolve, reject) => {
    const data = generateWaterLevelData(deviceId);
    const postData = JSON.stringify(data);
    
    const url = new URL(config.url + '/api/water-level');
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-key': config.apiKey
      },
      timeout: 10000
    };
    
    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        stats.totalRequests++;
        
        if (res.statusCode === 200) {
          stats.successful++;
          if (attempt === 1) {
            process.stdout.write(`✅ Device ${data.deviceId}: ${data.waterPercentage}% (${res.statusCode})\n`);
          }
          resolve({ success: true, deviceId: data.deviceId, statusCode: res.statusCode });
        } else {
          stats.failed++;
          const error = `Device ${data.deviceId}: HTTP ${res.statusCode} - ${responseData}`;
          stats.errors.push(error);
          if (attempt === 1) {
            process.stdout.write(`❌ ${error}\n`);
          }
          resolve({ success: false, deviceId: data.deviceId, statusCode: res.statusCode, error });
        }
      });
    });
    
    req.on('error', (error) => {
      stats.totalRequests++;
      stats.failed++;
      const errorMsg = `Device ${data.deviceId}: ${error.message}`;
      stats.errors.push(errorMsg);
      if (attempt === 1) {
        process.stdout.write(`❌ ${errorMsg}\n`);
      }
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      stats.totalRequests++;
      stats.failed++;
      const errorMsg = `Device ${data.deviceId}: Request timeout`;
      stats.errors.push(errorMsg);
      if (attempt === 1) {
        process.stdout.write(`❌ ${errorMsg}\n`);
      }
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Simulate IoT device
async function simulateDevice(deviceId) {
  const endTime = Date.now() + (config.duration * 60 * 1000);
  
  while (Date.now() < endTime) {
    try {
      await sendWaterLevelData(deviceId);
    } catch (error) {
      // Error already logged in sendWaterLevelData
    }
    
    // Wait for next interval
    await new Promise(resolve => setTimeout(resolve, config.interval * 1000));
  }
}

// Print statistics
function printStats() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Test Duration: ${config.duration} minutes`);
  console.log(`Devices Simulated: ${config.devices}`);
  console.log(`Request Interval: ${config.interval} seconds`);
  console.log(`API URL: ${config.url}`);
  console.log('='.repeat(60));
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful: ${stats.successful} (${((stats.successful / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`❌ Failed: ${stats.failed} (${((stats.failed / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log('='.repeat(60));
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors (showing first 10):');
    stats.errors.slice(0, 10).forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`  ... and ${stats.errors.length - 10} more errors`);
    }
  }
  
  // Calculate requests per minute
  const actualDuration = (stats.endTime - stats.startTime) / 1000 / 60; // minutes
  const requestsPerMinute = stats.totalRequests / actualDuration;
  console.log(`\n📈 Performance:`);
  console.log(`   Requests per minute: ${requestsPerMinute.toFixed(2)}`);
  console.log(`   Requests per second: ${(requestsPerMinute / 60).toFixed(2)}`);
  console.log('='.repeat(60) + '\n');
}

// Main function
async function main() {
  console.log('🚀 Starting IoT Load Test');
  console.log('='.repeat(60));
  console.log(`Devices: ${config.devices}`);
  console.log(`Interval: ${config.interval} seconds`);
  console.log(`Duration: ${config.duration} minutes`);
  console.log(`API URL: ${config.url}`);
  console.log('='.repeat(60) + '\n');
  
  // Test connection first
  console.log('🔍 Testing connection...');
  try {
    await sendWaterLevelData(1);
    console.log('✅ Connection successful!\n');
  } catch (error) {
    console.error('❌ Connection failed! Make sure server is running.');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
  
  stats.startTime = Date.now();
  
  // Start all devices
  console.log(`📡 Starting ${config.devices} IoT devices...\n`);
  const devicePromises = [];
  for (let i = 1; i <= config.devices; i++) {
    devicePromises.push(simulateDevice(i));
  }
  
  // Wait for all devices to complete
  await Promise.all(devicePromises);
  
  stats.endTime = Date.now();
  
  // Print statistics
  printStats();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  stats.endTime = Date.now();
  printStats();
  process.exit(0);
});

// Run the test
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

