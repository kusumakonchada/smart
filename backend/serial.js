// SmartMed Serial Port Reader for USB-connected Arduino
// Reads JSON telemetry lines from COM/Serial port and forwards to backend/server.js

import http from 'http';

const SERIAL_PORT_NAME = process.env.SERIAL_PORT || 'COM3';
const SERVER_URL = 'http://localhost:5000/api/hardware/event';

console.log(`[SmartMed Serial] Initializing listener on ${SERIAL_PORT_NAME}...`);
console.log(`[SmartMed Serial] Forwards IR/Pill detection events to ${SERVER_URL}`);

// Helper to post hardware payload to backend server
export function forwardHardwareEvent(event) {
  const data = JSON.stringify(event);
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/hardware/event',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, res => {
    console.log(`[SmartMed Serial] Forwarded event: ${res.statusCode}`);
  });

  req.on('error', err => {
    console.warn('[SmartMed Serial] Bridge server not reached:', err.message);
  });

  req.write(data);
  req.end();
}
