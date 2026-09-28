// SmartMed IoT Hardware Bridge Server
// Receives events from physical Smart Medicine Box (Arduino/ESP32) and synchronizes with Web Application

import http from 'http';

const PORT = process.env.PORT || 5000;

// In-memory clients list for WebSocket / SSE real-time broadcast
const sseClients = new Set();

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', product: 'SmartMed', timestamp: new Date().toISOString() }));
    return;
  }

  // Real-time SSE stream endpoint for Web Dashboard
  if (req.method === 'GET' && req.url === '/api/hardware/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('data: {"type":"connected","message":"Connected to SmartMed Hardware Stream"}\n\n');
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Hardware event ingestion endpoint: POST /api/hardware/event
  // Payload: { "medicineId": "12", "status": "taken", "takenAt": "2026-09-28T22:04:00" }
  if (req.method === 'POST' && req.url === '/api/hardware/event') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        console.log('[SmartMed Hardware Event Received]:', payload);

        const eventData = {
          type: 'medicine_status_change',
          medicineId: payload.medicineId,
          status: payload.status || 'taken',
          takenAt: payload.takenAt || new Date().toISOString(),
          slot: payload.slot || 1,
          deviceId: payload.deviceId || 'SmartMed-Box-01'
        };

        // Broadcast to all connected web dashboards
        const sseMessage = `data: ${JSON.stringify(eventData)}\n\n`;
        sseClients.forEach(client => {
          client.write(sseMessage);
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, processed: eventData }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[SmartMed] IoT Hardware Bridge Server running on http://localhost:${PORT}`);
});
