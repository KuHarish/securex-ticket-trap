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
      const isLocked = !!lockResults[index];
      
      let status = 'AVAILABLE';
      if (isSold) status = 'SOLD';
      else if (isLocked) status = 'RESERVED';
      
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

router.post('/:eventId/reserve', async (req, res) => {
  const { eventId } = req.params;
  const { ticketIds } = req.body;
  if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid tickets' });
  }
  const reservationId = `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  try {
    const { inventoryService } = await import('../services/inventoryService.js');
    const success = await inventoryService.reserveTickets(eventId, ticketIds, reservationId);
    if (success) {
      res.json({ success: true, reservationId });
    } else {
      res.status(409).json({ success: false, message: 'Seats unavailable' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reserving tickets' });
  }
});

router.post('/:eventId/release', async (req, res) => {
  const { eventId } = req.params;
  const { ticketIds } = req.body;
  if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid tickets' });
  }
  try {
    const { inventoryService } = await import('../services/inventoryService.js');
    await inventoryService.releaseTickets(eventId, ticketIds);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error releasing tickets' });
  }
});

export default router;
