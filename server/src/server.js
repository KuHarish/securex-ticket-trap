import app from './app.js';
import { connectRedis } from './config/redis.js';
import redisClient from './config/redis.js';
import { inventoryService } from './services/inventoryService.js';
import { wsService } from './services/wsService.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectRedis();

  // Initialize event inventory for demo event "EVT-001" which matches mockEvent.id in frontend
  const demoSeats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];
  await inventoryService.initializeEvent('EVT-001', demoSeats);

  const server = app.listen(PORT, () => {
    console.log(`Ticket Trap API running on port ${PORT}`);
  });

  // Initialize WebSockets
  wsService.init(server);

  // Subscribe to Redis keyspace expirations to broadcast released seats
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  
  await subscriber.subscribe('__keyevent@0__:expired', (key) => {
    // Expected key format: lock:EVT-001:A1
    if (key.startsWith('lock:')) {
      const parts = key.split(':');
      if (parts.length === 3) {
        const eventId = parts[1];
        const seatId = parts[2];
        wsService.broadcastSeatUpdate(eventId, seatId, 'AVAILABLE');
      }
    }
  });
};

startServer();
