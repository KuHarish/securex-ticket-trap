import express from 'express';
import redisClient from '../config/redis.js';

const router = express.Router();

router.get('/:eventId/seats', async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const allSeats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];
    
    if (!redisClient.isReady) {
       return res.status(500).json({ success: false, message: 'Redis unavailable' });
    }

    const multi = redisClient.multi();
    // Get ticket state
    allSeats.forEach(seatId => {
      multi.get(`ticket:${eventId}:${seatId}`);
    });
    // Get lock state
    allSeats.forEach(seatId => {
      multi.exists(`lock:${eventId}:${seatId}`);
    });
    const results = await multi.exec();

    // The first half of results are tickets, second half are locks
    const ticketResults = results.slice(0, allSeats.length);
    const lockResults = results.slice(allSeats.length);

    const seats = allSeats.map((id, index) => {
      const isSold = ticketResults[index] === 'SOLD';
      const isLocked = !!lockResults[index]; // Cast truthy/number to boolean
      
      const status = (isSold || isLocked) ? 'sold' : 'available';
      
      return {
        id,
        label: id,
        status
      };
    });

    res.json({ success: true, seats });
  } catch (error) {
    console.error("Failed to fetch seats:", error);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
});

export default router;
