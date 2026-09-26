const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected to WS');
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('WS Error:', err.message);
  process.exit(1);
});
