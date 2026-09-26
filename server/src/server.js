import app from './app.js';
import { connectRedis } from './config/redis.js';
import { inventoryService } from './services/inventoryService.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectRedis();

  // Initialize event inventory for demo event "EVT-001" which matches mockEvent.id in frontend
  const demoSeats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];
  await inventoryService.initializeEvent('EVT-001', demoSeats);

  app.listen(PORT, () => {
    console.log(`Ticket Trap API running on port ${PORT}`);
  });
};

startServer();
